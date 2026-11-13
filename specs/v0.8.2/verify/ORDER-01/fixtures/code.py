"""
code.py - Python test fixture for workbench-tauri scrolling and syntax tests.
"""

import sys
import os
import math

def calculate_primes(limit: int) -> list[int]:
    """Calculate all prime numbers up to limit using Sieve of Eratosthenes."""
    if limit < 2:
        return []
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    for i in range(2, int(math.isqrt(limit)) + 1):
        if sieve[i]:
            for j in range(i * i, limit + 1, i):
                sieve[j] = False
    return [i for i, is_prime in enumerate(sieve) if is_prime]

class Matrix:
    """A simple 2D matrix class for demonstration."""
    def __init__(self, rows: int, cols: int, initial_value: float = 0.0):
        self.rows = rows
        self.cols = cols
        self.data = [[initial_value for _ in range(cols)] for _ in range(rows)]

    def get(self, r: int, c: int) -> float:
        return self.data[r][c]

    def set(self, r: int, c: int, val: float) -> None:
        self.data[r][c] = val

    def transpose(self) -> 'Matrix':
        result = Matrix(self.cols, self.rows)
        for r in range(self.rows):
            for c in range(self.cols):
                result.set(c, r, self.get(r, c))
        return result

    def multiply(self, other: 'Matrix') -> 'Matrix':
        if self.cols != other.rows:
            raise ValueError("Incompatible dimensions for matrix multiplication")
        result = Matrix(self.rows, other.cols)
        for i in range(self.rows):
            for j in range(other.cols):
                total = sum(self.get(i, k) * other.get(k, j) for k in range(self.cols))
                result.set(i, j, total)
        return result

    def __repr__(self) -> str:
        lines = []
        for row in self.data:
            lines.append(" ".join(f"{v:6.2f}" for v in row))
        return "\n".join(lines)

def process_file_data(path: str) -> dict[str, int]:
    """Mock file processor for analytics."""
    counts = {}
    if not os.path.exists(path):
        return {"error": 1}
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            for word in line.strip().split():
                clean_word = word.lower().strip(".,!?:;\"'")
                if clean_word:
                    counts[clean_word] = counts.get(clean_word, 0) + 1
    return counts

def fibonacci_generator(n: int):
    """Yield first n Fibonacci numbers."""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

class TreeNode:
    """Binary tree node for traversal demonstrations."""
    def __init__(self, val: int, left: 'TreeNode | None' = None, right: 'TreeNode | None' = None):
        self.val = val
        self.left = left
        self.right = right

def inorder_traversal(root: TreeNode | None) -> list[int]:
    """Perform in-order traversal of binary tree."""
    if not root:
        return []
    return inorder_traversal(root.left) + [root.val] + inorder_traversal(root.right)

def preorder_traversal(root: TreeNode | None) -> list[int]:
    """Perform pre-order traversal of binary tree."""
    if not root:
        return []
    return [root.val] + preorder_traversal(root.left) + preorder_traversal(root.right)

def postorder_traversal(root: TreeNode | None) -> list[int]:
    """Perform post-order traversal of binary tree."""
    if not root:
        return []
    return postorder_traversal(root.left) + postorder_traversal(root.right) + [root.val]

def target_function_reached():
    """Function at line ~120 for scroll target inspection."""
    message = "Target function reached successfully"
    print(message)
    return message

def generate_report():
    """Generates sample diagnostic report."""
    primes = calculate_primes(50)
    print("Primes up to 50:", primes)
    m1 = Matrix(3, 3, 1.0)
    m2 = Matrix(3, 3, 2.0)
    m3 = m1.multiply(m2)
    print("Multiplication result:")
    print(m3)
    fibs = list(fibonacci_generator(10))
    print("Fibonacci 10:", fibs)

if __name__ == "__main__":
    generate_report()
    target_function_reached()
