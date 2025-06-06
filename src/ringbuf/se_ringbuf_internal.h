#pragma once
#include "se_ringbuf.h"
#include "se_ringbuf_observer.h"

#ifndef SE_RINGBUF_ENABLE_OBSERVER

static inline void se_ringbuf_notify_init(se_ringbuf_t *rb) {
    if (rb->observer && rb->observer->on_init) {
        rb->observer->on_init(rb);
    }
}

static inline void se_ringbuf_notify_clear(se_ringbuf_t *rb) {
    if (rb->observer && rb->observer->on_clear) {
        rb->observer->on_clear(rb);
    }
}

static inline void se_ringbuf_notify_write(se_ringbuf_t *rb, uint16_t bytes_written) {
    if (rb->observer && rb->observer->on_write) {
        rb->observer->on_write(rb, bytes_written);
    }
}

static inline void se_ringbuf_notify_read(se_ringbuf_t *rb, uint16_t bytes_read) {
    if (rb->observer && rb->observer->on_read) {
        rb->observer->on_read(rb, bytes_read);
    }
}

#else

// Empty stubs to avoid ifdefs in caller code
static inline void se_ringbuf_notify_init(se_ringbuf_t *rb) { (void)rb; }
static inline void se_ringbuf_notify_clear(se_ringbuf_t *rb) { (void)rb; }
static inline void se_ringbuf_notify_write(se_ringbuf_t *rb, uint16_t bytes_written) { (void)rb; (void)bytes_written; }
static inline void se_ringbuf_notify_read(se_ringbuf_t *rb, uint16_t bytes_read)  { (void)rb; (void)bytes_read;}

#endif
