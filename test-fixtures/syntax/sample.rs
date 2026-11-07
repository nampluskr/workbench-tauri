// Rust sample. 심볼 확인 위치: 21행 (impl Counter > fn bump > fn clamp)
use std::collections::HashMap;

/// A counter keyed by name.
#[derive(Debug, Default)]
pub struct Counter {
    counts: HashMap<String, u32>,
}

pub enum Step {
    One,
    Many(u32),
}

const MAX: u32 = 1_000;

impl Counter {
    pub fn bump(&mut self, key: &str, step: Step) -> u32 {
        fn clamp(value: u32) -> u32 {
            // innermost symbol line
            value.min(MAX)
        }
        let by = match step {
            Step::One => 1,
            Step::Many(n) => n,
        };
        let entry = self.counts.entry(key.to_string()).or_insert(0);
        *entry = clamp(*entry + by);
        *entry
    }
}

fn main() {
    let mut c = Counter::default();
    println!("{}", c.bump("a", Step::Many(3)));
    let _raw = r#"raw "string""#;
}
