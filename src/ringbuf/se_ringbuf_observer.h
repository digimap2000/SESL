/**
 * @file se_ringbuf_observer.h
 * @brief Observer interface for se_ringbuf_t to enable introspection and event notification.
 *
 * This optional module provides a lightweight, non-invasive way to observe ring buffer events such as
 * reads, writes, and overwrites. It is intended for logging, debugging, instrumentation, or integration
 * with telemetry systems.
 *
 * Features:
 *  - Transparent to core ring buffer usage; ring buffer remains unaware of observers.
 *  - Callbacks are invoked after relevant operations (write, read, overwrite).
 *  - All callbacks are optional; unused events incur zero cost.
 *  - Safe for use in embedded and constrained systems.
 *
 * Usage:
 *  1. Define a se_ringbuf_observer_t structure with desired callbacks.
 *  2. Set the observer pointer on the se_ringbuf_t instance.
 *  3. Ring buffer operations will invoke the observer hooks as appropriate.
 *
 * Example:
 *  @code
 *  void my_on_write(se_ringbuf_t *rb, uint16_t index, uint8_t value) {
 *      printf("Wrote %u to index %u\n", value, index);
 *  }
 *
 *  se_ringbuf_observer_t obs = {
 *      .on_write = my_on_write
 *  };
 *
 *  se_ringbuf_t rb;
 *  se_ringbuf_init(&rb, buffer, sizeof(buffer));
 *  rb.observer = &obs;
 *  se_ringbuf_write(&rb, data, len);
 *  @endcode
 *
 * @author
 *   Andrew Stevens, 2024
 */

#pragma once

#include <stdint.h>
#include <stddef.h>
#include "se_ringbuf.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct se_ringbuf_observer_t {
    void (*on_init)(se_ringbuf_t *rb);
    void (*on_clear)(se_ringbuf_t *rb);
    void (*on_write)(se_ringbuf_t *rb, uint16_t bytes_written);
    void (*on_read)(se_ringbuf_t *rb, uint16_t bytes_read);

} se_ringbuf_observer_t;

#ifdef __cplusplus
}
#endif
