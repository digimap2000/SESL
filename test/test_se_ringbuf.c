#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <assert.h>
#include <stdlib.h>
#include "se_ringbuf.h"

// Define a minimal ring buffer implementation for test if needed
#define TEST_RINGBUF_BYTES      8
#define TEST_RINGBUF_CAPACITY   (TEST_RINGBUF_BYTES - 1)


static void test_basic_write_read() {
    printf("Test: basic write/read\n");

    se_ringbuf_t rb;
    uint8_t buffer[TEST_RINGBUF_BYTES];

    assert(se_ringbuf_init(&rb, buffer, sizeof(buffer)) == true);

    uint8_t input[] = {1, 2, 3, 4};
    uint16_t written = se_ringbuf_write(&rb, input, 4);
    assert(written == 4);

    assert(se_ringbuf_count(&rb) == 4);
    assert(!se_ringbuf_is_empty(&rb));
    assert(!se_ringbuf_is_full(&rb));

    uint8_t output[4] = {0};
    uint16_t read = se_ringbuf_read(&rb, output, 4);
    assert(read == 4);
    assert(memcmp(input, output, sizeof(input)) == 0);
    assert(se_ringbuf_is_empty(&rb));
}

static void test_overflow() {
    printf("Test: overflow handling\n");

    uint8_t buffer[TEST_RINGBUF_BYTES];
    se_ringbuf_t rb;
    assert(se_ringbuf_init(&rb, buffer, sizeof(buffer)));

    uint8_t input[TEST_RINGBUF_CAPACITY + 1];
    for (uint32_t i = 0; i < sizeof(input); ++i) {
        input[i] = i & 0xFF;
    }

    size_t written = se_ringbuf_write(&rb, input, TEST_RINGBUF_CAPACITY + 1);
    assert(written == TEST_RINGBUF_CAPACITY);
    assert(se_ringbuf_is_full(&rb));
}

static void test_clear() {
    printf("Test: clear\n");

    uint32_t buffer[TEST_RINGBUF_BYTES];
    se_ringbuf_t rb;
    assert(se_ringbuf_init(&rb, buffer, TEST_RINGBUF_BYTES));

    uint32_t input[] = {99, 98};
    se_ringbuf_write(&rb, input, 2);

    se_ringbuf_clear(&rb);
    assert(se_ringbuf_is_empty(&rb));
    assert(se_ringbuf_count(&rb) == 0);
}

static void test_wraparound() {
    printf("Test: wraparound\n");

    se_ringbuf_t rb;
    uint8_t buffer[8];
    assert(se_ringbuf_init(&rb, buffer, 8));

    // Fill buffer to capacity-1
    uint8_t input1[7] = {10, 11, 12, 13, 14, 15, 16};
    assert(se_ringbuf_write(&rb, input1, 7) == 7);
    assert(se_ringbuf_is_full(&rb));

    // Read 3 elements
    uint8_t output1[3];
    assert(se_ringbuf_read(&rb, output1, 3) == 3);
    assert(output1[0] == 10 && output1[1] == 11 && output1[2] == 12);

    // Write 3 more elements (should wrap head)
    uint8_t input2[3] = {21, 22, 23};
    assert(se_ringbuf_write(&rb, input2, 3) == 3);

    // Read all remaining elements
    uint8_t output2[7];
    assert(se_ringbuf_read(&rb, output2, 7) == 7); // 7 in, 3 out, 3 in, so 7 left

    // The expected output is: 13, 14, 15, 16, 21, 22, 23
    uint8_t expected[] = {13, 14, 15, 16, 21, 22, 23};
    assert(memcmp(output2, expected, 7) == 0);
}

static void test_read_empty() {
    printf("Test: read from empty buffer\n");
    se_ringbuf_t rb;
    uint8_t buffer[8];
    assert(se_ringbuf_init(&rb, buffer, 8));
    uint8_t output[4] = {0xAA, 0xAA, 0xAA, 0xAA};
    assert(se_ringbuf_read(&rb, output, 4) == 0);
    // Output should remain unchanged
    for (int i = 0; i < 4; ++i) assert(output[i] == 0xAA);
}

static void test_write_zero() {
    printf("Test: write zero elements\n");
    se_ringbuf_t rb;
    uint8_t buffer[8];
    assert(se_ringbuf_init(&rb, buffer, 8));
    uint8_t input[4] = {1, 2, 3, 4};
    assert(se_ringbuf_write(&rb, input, 0) == 0);
    assert(se_ringbuf_is_empty(&rb));
}

static void test_read_zero() {
    printf("Test: read zero elements\n");
    se_ringbuf_t rb;
    uint8_t buffer[8];
    assert(se_ringbuf_init(&rb, buffer, 8));
    uint8_t input[4] = {1, 2, 3, 4};
    se_ringbuf_write(&rb, input, 4);
    uint8_t output[4] = {0};
    assert(se_ringbuf_read(&rb, output, 0) == 0);
    assert(se_ringbuf_count(&rb) == 4);
}

static void test_partial_read() {
    printf("Test: partial read\n");
    se_ringbuf_t rb;
    uint8_t buffer[8];
    assert(se_ringbuf_init(&rb, buffer, 8));
    uint8_t input[4] = {1, 2, 3, 4};
    se_ringbuf_write(&rb, input, 4);
    uint8_t output[2] = {0};
    assert(se_ringbuf_read(&rb, output, 2) == 2);
    assert(output[0] == 1 && output[1] == 2);
    assert(se_ringbuf_count(&rb) == 2);
}

static void test_partial_write() {
    printf("Test: partial write\n");
    se_ringbuf_t rb;
    uint8_t buffer[4];
    assert(se_ringbuf_init(&rb, buffer, sizeof(buffer)));
    uint8_t input1[2] = {1, 2};
    assert(se_ringbuf_write(&rb, input1, sizeof(input1)) == sizeof(input1));
    uint8_t input2[3] = {4, 5, 6};
    // Only one space left
    assert(se_ringbuf_write(&rb, input2, sizeof(input2)) == 1);
    assert(se_ringbuf_is_full(&rb));
}

static void test_non_power_of_two() {
    printf("Test: non-power-of-two buffer size\n");
    se_ringbuf_t rb;
    uint8_t buffer[7];
    assert(se_ringbuf_init(&rb, buffer, 7));
    uint8_t input[6] = {1, 2, 3, 4, 5, 6};
    assert(se_ringbuf_write(&rb, input, 7) == 6); // Only 6 can be written
    assert(se_ringbuf_is_full(&rb));
    uint8_t output[6] = {0};
    assert(se_ringbuf_read(&rb, output, 7) == 6);
    assert(memcmp(input, output, 6) == 0);
    assert(se_ringbuf_is_empty(&rb));
}

static void test_ping_pong() {
    printf("Test: ping-pong single write/read\n");
    se_ringbuf_t rb;
    uint8_t buffer[4];
    assert(se_ringbuf_init(&rb, buffer, 4));
    for (uint8_t i = 0; i < 20; ++i) {
        assert(se_ringbuf_write(&rb, &i, 1) == 1);
        uint8_t out = 0xFF;
        assert(se_ringbuf_read(&rb, &out, 1) == 1);
        assert(out == i);
        assert(se_ringbuf_is_empty(&rb));
    }
}

static void test_over_read() {
    printf("Test: over-read\n");
    se_ringbuf_t rb;
    uint8_t buffer[4];
    assert(se_ringbuf_init(&rb, buffer, 4));
    uint8_t input[2] = {42, 43};
    se_ringbuf_write(&rb, input, 2);
    uint8_t output[4] = {0};
    assert(se_ringbuf_read(&rb, output, 4) == 2);
    assert(output[0] == 42 && output[1] == 43);
    assert(se_ringbuf_is_empty(&rb));
}

static void test_over_write() {
    printf("Test: over-write\n");
    se_ringbuf_t rb;
    uint8_t buffer[4];
    assert(se_ringbuf_init(&rb, buffer, 4));
    uint8_t input[8] = {1,2,3,4,5,6,7,8};
    assert(se_ringbuf_write(&rb, input, 8) == sizeof(buffer) - 1);
    assert(se_ringbuf_is_full(&rb));
}

static void test_clear_partial() {
    printf("Test: clear after partial fill\n");
    se_ringbuf_t rb;
    uint8_t buffer[4];
    assert(se_ringbuf_init(&rb, buffer, 4));
    uint8_t input[2] = {9, 8};
    se_ringbuf_write(&rb, input, 2);
    se_ringbuf_clear(&rb);
    assert(se_ringbuf_is_empty(&rb));
    assert(se_ringbuf_count(&rb) == 0);
    // Try writing again after clear
    assert(se_ringbuf_write(&rb, input, 2) == 2);
    assert(se_ringbuf_count(&rb) == 2);
}

static void test_null_and_zero_init() {
    printf("Test: NULL and zero-capacity init\n");
    se_ringbuf_t rb;
    uint8_t buffer[4];
    assert(!se_ringbuf_init(NULL, buffer, 4));
    assert(!se_ringbuf_init(&rb, NULL, 4));
    assert(!se_ringbuf_init(&rb, buffer, 0));
}

static void test_misaligned_buffer() {
    printf("Test: misaligned buffer\n");
    uint8_t raw[10];
    // Make buffer start at an odd address (misaligned for uint16_t/uint32_t)
    uint8_t *misaligned = raw + 1;
    se_ringbuf_t rb;
    assert(se_ringbuf_init(&rb, misaligned, 8));
    uint8_t input[7] = {1,2,3,4,5,6,7};
    assert(se_ringbuf_write(&rb, input, 7) == 7);
    uint8_t output[7] = {0};
    assert(se_ringbuf_read(&rb, output, 7) == 7);
    assert(memcmp(input, output, 7) == 0);
    assert(se_ringbuf_is_empty(&rb));
}

static void test_stress_random_rw() {
    printf("Test: stress random read/write\n");
    const int bufsize = 32;
    const int datalen = 10000;
    se_ringbuf_t rb;
    uint8_t buffer[bufsize];
    assert(se_ringbuf_init(&rb, buffer, bufsize));

    // Generate pseudo-random data
    uint8_t data[datalen];
    for (int i = 0; i < datalen; ++i)
        data[i] = (uint8_t)(rand() & 0xFF);

    int write_pos = 0, read_pos = 0;
    uint8_t out[datalen];

    while (read_pos < datalen) {
        // Random write
        if (write_pos < datalen) {
            int space = bufsize - se_ringbuf_count(&rb) - 1;
            int to_write = (rand() % (space + 1));
            if (to_write > datalen - write_pos)
                to_write = datalen - write_pos;
            if (to_write > 0) {
                int written = se_ringbuf_write(&rb, &data[write_pos], to_write);
                assert(written == to_write);
                write_pos += written;
            }
        }

        // Random read
        int available = se_ringbuf_count(&rb);
        int to_read = (rand() % (available + 1));
        if (to_read > datalen - read_pos)
            to_read = datalen - read_pos;
        if (to_read > 0) {
            int read = se_ringbuf_read(&rb, &out[read_pos], to_read);
            assert(read == to_read);
            read_pos += read;
        }
    }

    // Verify data integrity
    assert(memcmp(data, out, datalen) == 0);
}

static void test_buffer_sizes() {
    printf("Test: buffer sizes\n");
    se_ringbuf_t rb;

    // Test sizes 0 to 1000
    for (uint16_t size = 2; size <= 1000; ++size) {
        uint8_t *buffer = (size > 0) ? malloc(size) : NULL;
        bool ok = se_ringbuf_init(&rb, buffer, size);
        if (size == 0 || buffer == NULL) {
            assert(!ok);
        } else {
            assert(ok);
            // Write and read a single byte
            uint8_t val = 0xA5, out = 0;
            assert(se_ringbuf_write(&rb, &val, 1) == 1);
            assert(se_ringbuf_read(&rb, &out, 1) == 1);
            assert(val == out);
            assert(se_ringbuf_is_empty(&rb));
        }
        free(buffer);
    }

    // Test Fibonacci sizes up to 65535
    uint32_t fib1 = 2, fib2 = 3;
    while (fib1 < 65536) {
        uint8_t *buffer = malloc((size_t)fib1);
        assert(buffer != NULL);
        assert(se_ringbuf_init(&rb, buffer, (uint16_t)fib1));
        // Write and read a single byte
        uint8_t val = 0x5A, out = 0;
        assert(se_ringbuf_write(&rb, &val, 1) == 1);
        assert(se_ringbuf_read(&rb, &out, 1) == 1);
        assert(val == out);
        assert(se_ringbuf_is_empty(&rb));
        free(buffer);
        uint32_t next = fib1 + fib2;
        fib1 = fib2;
        fib2 = next;
    }
}

static void test_null_pointer_args() {
    printf("Test: NULL pointer arguments\n");

    se_ringbuf_t rb;
    uint8_t buffer[8];
    uint8_t data[4] = {0};

    // NULL ring buffer pointer
    assert(!se_ringbuf_init(NULL, buffer, 8));
    se_ringbuf_clear(NULL);
    assert(se_ringbuf_is_empty(NULL));
    assert(!se_ringbuf_is_full(NULL));
    assert(se_ringbuf_count(NULL) == 0);
    assert(se_ringbuf_write(NULL, data, 4) == 0);
    assert(se_ringbuf_read(NULL, data, 4) == 0);

    // NULL buffer pointer in init
    assert(!se_ringbuf_init(&rb, NULL, 8));

    // NULL data pointer in write/read
    assert(se_ringbuf_init(&rb, buffer, 8));
    assert(se_ringbuf_write(&rb, NULL, 4) == 0);
    assert(se_ringbuf_read(&rb, NULL, 4) == 0);
}

static void test_memory_overlap() {
    printf("Test: memory overlap\n");
    se_ringbuf_t rb;
    uint8_t buffer[8] = {1,2,3,4,5,6,7,8};
    assert(se_ringbuf_init(&rb, buffer, 8));

    // Write from buffer itself (overlap)
    assert(se_ringbuf_write(&rb, buffer, 4) == 4);

    // Read back into the same buffer (overlap)
    assert(se_ringbuf_read(&rb, buffer, 4) == 4);

    // The buffer should now contain the original values written
    for (int i = 0; i < 4; ++i)
        assert(buffer[i] == i + 1);
}

int test_se_ringbuf_main(void) {
    test_basic_write_read();
    test_overflow();
    test_clear();
    test_wraparound();
    test_read_empty();
    test_write_zero();
    test_read_zero();
    test_partial_read();
    test_partial_write();
    test_non_power_of_two();
    test_ping_pong();
    test_over_read();
    test_over_write();
    test_clear_partial();
    test_null_and_zero_init();
    test_misaligned_buffer();
    test_stress_random_rw();
    test_buffer_sizes();
    test_null_pointer_args();
    test_memory_overlap();

    printf("All tests passed.\n");
    return 0;
}
