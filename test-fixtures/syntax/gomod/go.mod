// Go Mod sample.
module example.com/sample

go 1.22

toolchain go1.22.4

require (
	github.com/google/uuid v1.6.0
	golang.org/x/text v0.14.0 // indirect
)

require gopkg.in/yaml.v3 v3.0.1

replace example.com/old => ../old

exclude golang.org/x/net v0.0.1

retract v1.0.1 // published by mistake
