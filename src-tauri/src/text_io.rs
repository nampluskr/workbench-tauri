use std::{fs, io::{self, Write}, path::Path, sync::atomic::{AtomicU64, Ordering}, time::{SystemTime, UNIX_EPOCH}};

type SaveError = serde_json::Value;
static NEXT: AtomicU64 = AtomicU64::new(0);

fn io_error(error: impl std::fmt::Display, kept_tmp: Option<String>) -> SaveError {
    serde_json::json!({"kind": "io", "message": error.to_string(), "kept_tmp": kept_tmp})
}

fn encode(text: &str, encoding: &str, line_ending: &str) -> Result<Vec<u8>, SaveError> {
    // shortcut: edited mixed line endings become one style; preserve per-line endings if required.
    let text = text.replace("\r\n", "\n");
    let text = match line_ending {
        "lf" => text,
        "crlf" => text.replace('\n', "\r\n"),
        _ => return Err(io_error("Invalid line ending", None)),
    };
    match encoding {
        "utf-8" => Ok(text.into_bytes()),
        "utf-8-bom" => Ok([&[0xef, 0xbb, 0xbf][..], text.as_bytes()].concat()),
        "utf-16le" | "utf-16be" => {
            let mut bytes = if encoding == "utf-16le" { vec![0xff, 0xfe] } else { vec![0xfe, 0xff] };
            for unit in text.encode_utf16() {
                bytes.extend_from_slice(&if encoding == "utf-16le" { unit.to_le_bytes() } else { unit.to_be_bytes() });
            }
            Ok(bytes)
        }
        "cp949" => {
            let (bytes, _, errors) = encoding_rs::EUC_KR.encode(&text);
            let (decoded, _, decode_errors) = encoding_rs::EUC_KR.decode(&bytes);
            if errors || decode_errors || decoded != text {
                let mut chars = Vec::new();
                for ch in text.chars() {
                    let s = ch.to_string();
                    let (encoded, _, errors) = encoding_rs::EUC_KR.encode(&s);
                    let (decoded, _, decode_errors) = encoding_rs::EUC_KR.decode(&encoded);
                    if (errors || decode_errors || decoded != s) && !chars.contains(&s) { chars.push(s); }
                }
                return Err(serde_json::json!({"kind": "unmappable", "chars": chars}));
            }
            Ok(bytes.into_owned())
        }
        _ => Err(io_error("Invalid encoding", None)),
    }
}

fn write_file_with(path: &Path, bytes: &[u8], replace: impl FnOnce(&Path, &Path) -> io::Result<()>) -> Result<(), SaveError> {
    let name = path.file_name().ok_or_else(|| io_error("Missing file name", None))?;
    let (tmp, mut file) = loop {
        // shortcut: time, process and counter are not UUIDs; create_new resolves collisions, use UUIDs if names need to be globally unique.
        let stamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_nanos();
        let mut tmp_name = name.to_os_string();
        tmp_name.push(format!(".{stamp:x}-{:x}-{:x}.tmp", std::process::id(), NEXT.fetch_add(1, Ordering::Relaxed)));
        let tmp = path.with_file_name(tmp_name);
        match fs::File::options().write(true).create_new(true).open(&tmp) {
            Ok(file) => break (tmp, file),
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => continue,
            Err(error) => return Err(io_error(error, None)),
        }
    };
    let written = file.write_all(bytes).and_then(|()| file.sync_all());
    drop(file);
    if let Err(error) = written {
        let kept = fs::remove_file(&tmp).err().map(|_| tmp.to_string_lossy().into_owned());
        return Err(io_error(error, kept));
    }
    if let Err(error) = replace(&tmp, path) {
        let kept = if path.exists() && fs::remove_file(&tmp).is_ok() { None } else { Some(tmp.to_string_lossy().into_owned()) };
        let message = match &kept { Some(path) => format!("{error}; saved text is kept in {path}"), None => error.to_string() };
        return Err(io_error(message, kept));
    }
    Ok(())
}

#[tauri::command]
pub async fn save_text(path: String, text: String, encoding: String, line_ending: String) -> Result<tauri::ipc::Response, SaveError> {
    tauri::async_runtime::spawn_blocking(move || {
        let bytes = encode(&text, &encoding, &line_ending)?;
        write_file_with(Path::new(&path), &bytes, crate::state::replace_file)?;
        Ok(tauri::ipc::Response::new(bytes))
    }).await.map_err(|error| io_error(error, None))?
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn temp() -> PathBuf {
        let dir = std::env::temp_dir().join(format!("workbench-text-{}-{}", std::process::id(), NEXT.fetch_add(1, Ordering::Relaxed)));
        fs::create_dir(&dir).unwrap();
        dir
    }

    #[test]
    fn encodings_match_shared_fixtures_and_round_trip() {
        let text = "한글 A\n둘째 줄\n";
        let cases: &[(&str, &str, &[u8])] = &[
            ("utf-8", "lf", include_bytes!("../../test-fixtures/encoding/utf8-lf.txt")),
            ("utf-8", "crlf", include_bytes!("../../test-fixtures/encoding/utf8-crlf.txt")),
            ("utf-8-bom", "lf", include_bytes!("../../test-fixtures/encoding/utf8-bom.txt")),
            ("utf-16le", "lf", include_bytes!("../../test-fixtures/encoding/utf16le-bom.txt")),
            ("utf-16be", "lf", include_bytes!("../../test-fixtures/encoding/utf16be-bom.txt")),
            ("cp949", "lf", include_bytes!("../../test-fixtures/encoding/cp949.txt")),
        ];
        let dir = temp();
        let path = dir.join("text.txt");
        for &(encoding, ending, expected) in cases {
            let bytes = encode(text, encoding, ending).unwrap();
            assert_eq!(bytes, expected, "{encoding} {ending}");
            assert!(tauri::async_runtime::block_on(save_text(path.to_string_lossy().into_owned(), text.into(), encoding.into(), ending.into())).is_ok());
            assert_eq!(fs::read(&path).unwrap(), expected);
            let decoded = match encoding {
                "utf-8" => String::from_utf8(bytes).unwrap(),
                "utf-8-bom" => String::from_utf8(bytes[3..].to_vec()).unwrap(),
                "utf-16le" | "utf-16be" => {
                    let units: Vec<u16> = bytes[2..].as_chunks::<2>().0.iter().map(|pair| {
                        if encoding == "utf-16le" { u16::from_le_bytes([pair[0], pair[1]]) }
                        else { u16::from_be_bytes([pair[0], pair[1]]) }
                    }).collect();
                    String::from_utf16(&units).unwrap()
                }
                "cp949" => encoding_rs::EUC_KR.decode(&bytes).0.into_owned(),
                _ => unreachable!(),
            };
            assert_eq!(decoded.replace("\r\n", "\n"), text);
        }
        assert_eq!(encode("a\r\nb\nc", "utf-8", "crlf").unwrap(), b"a\r\nb\r\nc");
        fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn unmappable_does_not_touch_disk() {
        let dir = temp();
        let path = dir.join("text.txt");
        fs::write(&path, b"old").unwrap();
        let text = std::str::from_utf8(include_bytes!("../../test-fixtures/encoding/unmappable.txt")).unwrap();
        let error = match tauri::async_runtime::block_on(save_text(path.to_string_lossy().into_owned(), text.into(), "cp949".into(), "lf".into())) {
            Ok(_) => panic!("unmappable text was saved"),
            Err(error) => error,
        };
        assert_eq!(error["kind"], "unmappable");
        assert_eq!(error["chars"], serde_json::json!(["😀", "₩", "¥"]));
        assert_eq!(fs::read(&path).unwrap(), b"old");
        fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn atomic_write_failure_branches() {
        let dir = temp();
        let path = dir.join("text.txt");
        let missing = dir.join("missing").join("text.txt");
        assert_eq!(write_file_with(&missing, b"new", |_, _| panic!("unexpected replacement")).unwrap_err()["kept_tmp"], serde_json::Value::Null);
        fs::write(&path, b"old").unwrap();
        let error = write_file_with(&path, b"new", |_, _| Err(io::Error::other("failed"))).unwrap_err();
        assert_eq!(error["kept_tmp"], serde_json::Value::Null);
        assert_eq!(fs::read(&path).unwrap(), b"old");
        assert_eq!(fs::read_dir(&dir).unwrap().count(), 1);
        let error = write_file_with(&path, b"new", |_, target| {
            fs::remove_file(target)?;
            Err(io::Error::other("failed"))
        }).unwrap_err();
        let kept = error["kept_tmp"].as_str().unwrap();
        assert!(error["message"].as_str().unwrap().contains(kept));
        assert_eq!(fs::read(kept).unwrap(), b"new");
        assert!(!path.exists());
        fs::remove_dir_all(dir).unwrap();
    }
}
