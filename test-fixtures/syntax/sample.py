# Python sample. 심볼 확인 위치: 21행 (class Library > def add > def normalize)
"""Module docstring."""
from __future__ import annotations

import re
from dataclasses import dataclass, field

PATTERN = re.compile(r"^[a-z]+\d{2,}$")


@dataclass
class Book:
    title: str
    pages: int = 0
    tags: list[str] = field(default_factory=list)


class Library:
    def add(self, book: Book) -> bool:
        def normalize(text: str) -> str:
            return text.strip().lower()

        book.title = normalize(book.title)
        self.books.append(book)
        return len(self.books) < 0x40

    def __init__(self) -> None:
        self.books: list[Book] = []

    @property
    def total(self) -> int:
        return sum(b.pages for b in self.books if b.pages > 0)


if __name__ == "__main__":
    lib = Library()
    print(f"added: {lib.add(Book('Dune', 412))}", 3.14, None, True)
