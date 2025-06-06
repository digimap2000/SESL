#include <stdio.h>

int test_se_ringbuf_main(void);
int test_se_ringbuf_observer_main(void);

int main(void) {
    int rc = 0;
    rc |= test_se_ringbuf_main();
    rc |= test_se_ringbuf_observer_main();
    if (rc == 0)
        printf("All tests (core + observer) passed.\n");
    else
        printf("Some tests failed.\n");
    return rc;
}