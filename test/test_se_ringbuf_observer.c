#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <assert.h>
#include "se_ringbuf.h"
#include "se_ringbuf_observer.h"

// Observer state for verification
typedef struct {
    int init_called;
    int clear_called;
    int write_called;
    int read_called;
    se_ringbuf_t *last_rb;
    uint16_t last_write;
    uint16_t last_read;
} observer_state_t;

static observer_state_t obs_state;

static void on_init(se_ringbuf_t *rb) {
    obs_state.init_called++;
    obs_state.last_rb = rb;
}
static void on_clear(se_ringbuf_t *rb) {
    obs_state.clear_called++;
    obs_state.last_rb = rb;
}
static void on_write(se_ringbuf_t *rb, uint16_t bytes_written) {
    obs_state.write_called++;
    obs_state.last_rb = rb;
    obs_state.last_write = bytes_written;
}
static void on_read(se_ringbuf_t *rb, uint16_t bytes_read) {
    obs_state.read_called++;
    obs_state.last_rb = rb;
    obs_state.last_read = bytes_read;
}

static void reset_observer_state(void) {
    memset(&obs_state, 0, sizeof(obs_state));
}

static void test_observer_callbacks() {
    printf("Test: observer callbacks\n");
    se_ringbuf_t rb;
    uint8_t buffer[8];

    se_ringbuf_observer_t observer = {
        .on_init = on_init,
        .on_clear = on_clear,
        .on_write = on_write,
        .on_read = on_read
    };
    rb.observer = &observer;

    // Test init
    reset_observer_state();
    assert(se_ringbuf_init(&rb, buffer, 8));
    assert(obs_state.init_called == 1);
    assert(obs_state.last_rb == &rb);

    // Test clear
    reset_observer_state();
    se_ringbuf_clear(&rb);
    assert(obs_state.clear_called == 1);
    assert(obs_state.last_rb == &rb);

    // Test write
    reset_observer_state();
    uint8_t in[4] = {1,2,3,4};
    assert(se_ringbuf_write(&rb, in, 4) == 4);
    assert(obs_state.write_called == 1);
    assert(obs_state.last_rb == &rb);
    assert(obs_state.last_write == 4);

    // Test partial write
    reset_observer_state();
    assert(se_ringbuf_write(&rb, in, 8) == 4); // Only 4 bytes space left
    assert(obs_state.write_called == 1);
    assert(obs_state.last_write == 4);

    // Test read
    reset_observer_state();
    uint8_t out[4];
    assert(se_ringbuf_read(&rb, out, 4) == 4);
    assert(obs_state.read_called == 1);
    assert(obs_state.last_rb == &rb);
    assert(obs_state.last_read == 4);

    // Test partial read
    reset_observer_state();
    assert(se_ringbuf_read(&rb, out, 8) == 4); // Only 4 bytes left
    assert(obs_state.read_called == 1);
    assert(obs_state.last_read == 4);
}

static void test_null_observer() {
    printf("Test: NULL observer\n");
    se_ringbuf_t rb;
    uint8_t buffer[8];
    rb.observer = NULL;

    // Should not crash or call any observer
    assert(se_ringbuf_init(&rb, buffer, 8));
    se_ringbuf_clear(&rb);
    uint8_t in[4] = {1,2,3,4};
    assert(se_ringbuf_write(&rb, in, 4) == 4);
    uint8_t out[4];
    assert(se_ringbuf_read(&rb, out, 4) == 4);
}

int test_se_ringbuf_observer_main(void) {
    test_observer_callbacks();
    test_null_observer();
    printf("All observer tests passed.\n");
    return 0;
}