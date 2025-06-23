// se_observe.c
#include "se_observe.h"
#include "se_ringbuf.h" // Or whatever transport you use

#include <stdio.h>

static void print_hex(const uint8_t *data, size_t len)
{
    for (size_t i = 0; i < len; i++)
    {
        printf("%02X", data[i]);
        if (i != len - 1)
            printf(" ");
    }
    printf("\n");
}

static size_t encode_varint(uint64_t val, uint8_t *out)
{
    size_t i = 0;
    while (val >= 0x80)
    {
        out[i++] = (val & 0x7F) | 0x80;
        val >>= 7;
    }
    out[i++] = val;
    return i;
}

void se_observe(uint32_t tag, uint64_t value)
{
    uint8_t buf[32];
    size_t idx = 0;

    // tag = 1
    buf[idx++] = 0x08; // (1 << 3) | 0 => varint
    idx += encode_varint(tag, &buf[idx]);

    // timestamp = 2
    buf[idx++] = 0x10;              // (2 << 3) | 0 => varint
    uint64_t ts = se_time_now_ns(); // user-defined
    idx += encode_varint(ts, &buf[idx]);

    // value = 3
    buf[idx++] = 0x18; // (3 << 3) | 0 => varint
    idx += encode_varint(value, &buf[idx]);

    print_hex(buf, idx);
}

uint64_t se_time_now_ns(void)
{
    return 0; // Default implementation returns 0 if not overridden
}