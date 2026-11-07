/* C sample. */
#include <stdio.h>
#include <stdlib.h>

#define LIMIT 40
#define SQUARE(x) ((x) * (x))

typedef struct {
    const char *name;
    unsigned int count;
    double ratio;
} Entry;

enum Color { RED, GREEN = 2, BLUE };

static int add(int a, int b) {
    return a + b; // line comment
}

int main(int argc, char **argv) {
    Entry e = { .name = "sample", .count = 0x1F, .ratio = 3.14 };
    char c = 'x';
    for (int i = 0; i < LIMIT && i < argc; i++) {
        e.count += (unsigned int)SQUARE(i);
    }
    if (e.count > 100) {
        printf("%s: %u %.2f %c\n", e.name, e.count, e.ratio, c);
    } else {
        fprintf(stderr, "small\n");
    }
    return add(0, BLUE) == 3 ? EXIT_SUCCESS : EXIT_FAILURE;
}
