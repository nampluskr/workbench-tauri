// Go sample.
package main

import (
	"errors"
	"fmt"
	"strings"
)

const limit = 40

// Shelf holds books.
type Shelf struct {
	Name  string
	Books []string
}

type Counter interface {
	Count() int
}

func (s *Shelf) Add(title string) error {
	if len(s.Books) >= limit {
		return errors.New("shelf is full")
	}
	s.Books = append(s.Books, strings.TrimSpace(title))
	return nil
}

func (s Shelf) Count() int { return len(s.Books) }

func main() {
	s := &Shelf{Name: "main"}
	var c Counter = s
	_ = s.Add(`raw title`)
	ch := make(chan int, 1)
	go func() { ch <- 0x2A }()
	fmt.Printf("%s %d %v %.1f\n", s.Name, c.Count(), <-ch, 3.5)
}
