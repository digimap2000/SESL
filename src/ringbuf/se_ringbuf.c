#include "se_ringbuf.h"
#include "se_ringbuf_internal.h"

static inline void se_ringbuf_memcpy(uint8_t *dst, const uint8_t *src, uint16_t n)
{
    for (uint16_t i = 0; i < n; ++i)
        dst[i] = src[i];
}

bool se_ringbuf_init(se_ringbuf_t *rb, void *buffer, uint16_t capacity)
{
    if (rb)
    {
        rb->observer = NULL;
        rb->buffer = (uint8_t *)buffer;
        rb->capacity = capacity;
        rb->head = 0;
        rb->count = 0;
        se_ringbuf_notify_init(rb);
    }
    return rb && rb->buffer && rb->capacity;
}

void se_ringbuf_clear(se_ringbuf_t *rb)
{
    if (rb)
    {
        rb->head = 0;
        rb->count = 0;
        se_ringbuf_notify_clear(rb);
    }
}

bool se_ringbuf_is_empty(const se_ringbuf_t *rb)
{
    return !rb || (rb->count == 0);
}

bool se_ringbuf_is_full(const se_ringbuf_t *rb)
{
    return (rb && rb->count == rb->capacity);
}

uint16_t se_ringbuf_count(const se_ringbuf_t *rb)
{
    return rb ? rb->count : 0;
}

uint16_t se_ringbuf_write(se_ringbuf_t *rb, const void *data, uint16_t count)
{
    if (!rb || !data || rb->capacity == 0)
        return 0;
    uint16_t space = rb->capacity - rb->count;
    uint16_t to_write = (count < space) ? count : space;
    if (to_write == 0)
        return 0;

    uint16_t head = rb->head;
    uint16_t first = rb->capacity - head;
    if (first > to_write)
        first = to_write;

    // First chunk: up to end of buffer
    se_ringbuf_memcpy(&rb->buffer[head], (const uint8_t *)data, first);

    // Second chunk: from start of buffer
    if (to_write > first)
        se_ringbuf_memcpy(&rb->buffer[0], (const uint8_t *)data + first, to_write - first);

    rb->head = (head + to_write < rb->capacity) ? (head + to_write) : (head + to_write - rb->capacity);
    rb->count += to_write;
    
    se_ringbuf_notify_write(rb, to_write);
    return to_write;
}

uint16_t se_ringbuf_read(se_ringbuf_t *rb, void *data, uint16_t count)
{
    if (!rb || !data || rb->count == 0)
        return 0;
    uint16_t to_read = (count < rb->count) ? count : rb->count;
    if (to_read == 0)
        return 0;

    uint16_t tail = (rb->head >= rb->count) ? (rb->head - rb->count) : (rb->capacity + rb->head - rb->count);
    uint16_t first = rb->capacity - tail;
    if (first > to_read)
        first = to_read;

    // First chunk: up to end of buffer
    se_ringbuf_memcpy((uint8_t *)data, &rb->buffer[tail], first);

    // Second chunk: from start of buffer
    if (to_read > first)
        se_ringbuf_memcpy((uint8_t *)data + first, &rb->buffer[0], to_read - first);

    rb->count -= to_read;
    se_ringbuf_notify_read(rb, to_read);
    return to_read;
}
