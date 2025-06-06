#include "se_ringbuf.h"
#include "se_ringbuf_internal.h"

static inline uint16_t _se_ringbuf_advance(uint16_t idx, uint16_t amount, uint16_t capacity) {
    idx += amount;
    if (idx >= capacity)
        idx -= capacity;
    return idx;
}

static inline uint16_t _se_ringbuf_fill(uint16_t head, uint16_t tail, uint16_t capacity) {
    return (head >= tail)
        ? head - tail
        : capacity - tail + head;
}

static inline uint16_t _se_ringbuf_free(uint16_t head, uint16_t tail, uint16_t capacity) {
    return (head >= tail)
        ? capacity - (head - tail) - 1
        : tail - head - 1;
}

static inline uint16_t _se_ringbuf_first_chunk(uint16_t idx, uint16_t capacity, uint16_t total) {
    uint16_t first = capacity - idx;
    return (first > total) ? total : first;
}

static inline void _se_ringbuf_memcpy(uint8_t *dst, const uint8_t *src, uint16_t n)
{
    for (uint16_t i = 0; i < n; ++i)
    {
        dst[i] = src[i];
    }
}

bool se_ringbuf_init(se_ringbuf_t *rb, void *buffer, uint16_t capacity)
{
    if (rb)
    {
        rb->observer = NULL;
        rb->buffer = (uint8_t *)buffer;
        rb->capacity = capacity;
        rb->head = 0;
        rb->tail = 0;
        se_ringbuf_notify_init(rb);
    }
    return rb && rb->buffer && rb->capacity;
}

void se_ringbuf_clear(se_ringbuf_t *rb)
{
    if (rb)
    {
        rb->head = 0;
        rb->tail = 0;
        se_ringbuf_notify_clear(rb);
    }
}

bool se_ringbuf_is_empty(const se_ringbuf_t *rb)
{
    return !rb || (rb->head == rb->tail);
}

bool se_ringbuf_is_full(const se_ringbuf_t *rb)
{
    return rb && _se_ringbuf_advance(rb->head, 1, rb->capacity) == rb->tail;
}

uint16_t se_ringbuf_count(const se_ringbuf_t *rb)
{
    return rb 
        ? _se_ringbuf_fill(rb->head, rb->tail, rb->capacity) 
        : 0;
}

uint16_t se_ringbuf_write(se_ringbuf_t *rb, const void *data, uint16_t count)
{
    if (!rb || !data || rb->capacity == 0)
        return 0;

    uint16_t tail = rb->tail;
    uint16_t head = rb->head;
    uint16_t capacity = rb->capacity;

    // Calculate number of writeable bytes
    uint16_t space = _se_ringbuf_free(head, tail, capacity);
    uint16_t to_write = (count < space) ? count : space;
    if (to_write == 0)
        return 0;

    // Efficient one or two chunk write
    uint16_t first = _se_ringbuf_first_chunk(head, capacity, to_write);
    _se_ringbuf_memcpy(&rb->buffer[head], (const uint8_t *)data, first);
    if (to_write > first)
        _se_ringbuf_memcpy(&rb->buffer[0], (const uint8_t *)data + first, to_write - first);

    rb->head = _se_ringbuf_advance(head, to_write, capacity);

    se_ringbuf_notify_write(rb, to_write);
    return to_write;
}

uint16_t se_ringbuf_read(se_ringbuf_t *rb, void *data, uint16_t count)
{
    if (!rb || !data || rb->head == rb->tail)
        return 0;

    uint16_t tail = rb->tail;
    uint16_t head = rb->head;
    uint16_t capacity = rb->capacity;

    // Calculate number of readable bytes
    uint16_t available = _se_ringbuf_fill(head, tail, capacity);
    uint16_t to_read = (count < available) ? count : available;
    if (to_read == 0)
        return 0;

    // Efficient one or two chunk read
    uint16_t first = _se_ringbuf_first_chunk(tail, capacity, to_read);
    _se_ringbuf_memcpy((uint8_t *)data, &rb->buffer[tail], first);
    if (to_read > first)
        _se_ringbuf_memcpy((uint8_t *)data + first, &rb->buffer[0], to_read - first);

    rb->tail = _se_ringbuf_advance(tail, to_read, capacity);

    se_ringbuf_notify_read(rb, to_read);
    return to_read;
}
