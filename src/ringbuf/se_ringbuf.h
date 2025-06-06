/**
 * @file se_ringbuf.h
 * @brief Simple, efficient byte-oriented ring buffer (circular buffer) implementation for C.
 *
 * This module provides a lightweight, portable ring buffer (FIFO) API for embedded and general C applications.
 * The buffer operates on user-supplied memory and supports single-producer, single-consumer usage.
 *
 * Features:
 *  - No dynamic memory allocation required; buffer and control structure can be statically or stack allocated.
 *  - Efficient, branch-minimized read/write with wraparound support.
 *  - Handles arbitrary buffer sizes (not limited to powers of two).
 *  - All operations are safe against NULL pointers and invalid arguments.
 *  - API is designed for byte-oriented data, but can be adapted for other element sizes.
 *
 * Usage:
 *  1. Allocate a buffer array and a se_ringbuf_t structure.
 *  2. Call se_ringbuf_init() to initialize.
 *  3. Use se_ringbuf_write() and se_ringbuf_read() to transfer data.
 *  4. Use se_ringbuf_is_empty(), se_ringbuf_is_full(), se_ringbuf_count(), and se_ringbuf_clear() as needed.
 *
 * Example:
 *  @code
 *  uint8_t buffer[128];
 *  se_ringbuf_t rb;
 *  se_ringbuf_init(&rb, buffer, sizeof(buffer));
 *  se_ringbuf_write(&rb, data, len);
 *  se_ringbuf_read(&rb, out, len);
 *  @endcode
 *
 * @author
 *   Andrew Stevens, 2024
 */

#pragma once

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

// C99 compliant forward declarations
struct se_ringbuf_observer_t;

/**
 * @brief Ring buffer structure.
 * @note Do not access members directly; use the API functions.
 */
typedef struct se_ringbuf_t {
    uint8_t *buffer;      /**< Pointer to buffer memory */
    uint16_t capacity;    /**< Buffer capacity in bytes */
    uint16_t head;        /**< Write index */
    uint16_t tail;        /**< Read index */
    const struct se_ringbuf_observer_t *observer; /**< Optional observer interface */
} se_ringbuf_t;

/**
 * @brief Initialize a ring buffer.
 *
 * Sets up a ring buffer structure to use a user-supplied memory buffer.
 * This function must be called before any other ring buffer operations.
 * The buffer memory must be at least @p capacity bytes and must remain valid for the lifetime of the ring buffer.
 * After initialization, the buffer is empty.
 *
 * @param rb Pointer to the ring buffer structure to initialize.
 * @param buffer Pointer to the memory to use as the ring buffer's storage.
 * @param capacity Size of the buffer in bytes.
 * @return true if initialization succeeded (all pointers valid and capacity > 0), false otherwise.
 */
bool se_ringbuf_init(se_ringbuf_t *rb, void *buffer, uint16_t capacity);

/**
 * @brief Write data to the ring buffer.
 *
 * Attempts to write up to @p count bytes from @p data into the ring buffer.
 * If there is not enough free space, only as many bytes as will fit are written.
 * The write operation may wrap around the end of the buffer.
 *
 * @param rb Pointer to the ring buffer structure.
 * @param data Pointer to the data to write into the buffer.
 * @param count Number of bytes to write.
 * @return Number of bytes actually written (may be less than @p count if buffer is full).
 */
uint16_t se_ringbuf_write(se_ringbuf_t *rb, const void *data, uint16_t count);

/**
 * @brief Read data from the ring buffer.
 *
 * Attempts to read up to @p count bytes from the ring buffer into @p data.
 * If there is not enough data available, only as many bytes as are present are read.
 * The read operation may wrap around the end of the buffer.
 *
 * @param rb Pointer to the ring buffer structure.
 * @param data Pointer to the buffer to store the read data.
 * @param count Number of bytes to read.
 * @return Number of bytes actually read (may be less than @p count if buffer is empty).
 */
uint16_t se_ringbuf_read(se_ringbuf_t *rb, void *data, uint16_t count);

/**
 * @brief Check if the ring buffer is empty.
 *
 * Determines whether the ring buffer contains any data.
 *
 * @param rb Pointer to the ring buffer structure.
 * @return true if the buffer is empty or @p rb is NULL, false otherwise.
 */
bool se_ringbuf_is_empty(const se_ringbuf_t *rb);

/**
 * @brief Check if the ring buffer is full.
 *
 * Determines whether the ring buffer is completely full (i.e., cannot accept more data).
 *
 * @param rb Pointer to the ring buffer structure.
 * @return true if the buffer is full, false otherwise.
 */
bool se_ringbuf_is_full(const se_ringbuf_t *rb);

/**
 * @brief Get the number of bytes currently stored in the ring buffer.
 *
 * Returns the number of bytes that can be read from the buffer before it becomes empty.
 *
 * @param rb Pointer to the ring buffer structure.
 * @return Number of bytes currently in the buffer, or 0 if @p rb is NULL.
 */
uint16_t se_ringbuf_count(const se_ringbuf_t *rb);

/**
 * @brief Get the capacity of the ring buffer.
 *
 * Returns the total capacity of the ring buffer (the maximum number of bytes it can hold).
 *
 * @param rb Pointer to the ring buffer structure.
 * @return Capacity in bytes, or 0 if @p rb is NULL.
 */
uint16_t se_ringbuf_capacity(const se_ringbuf_t *rb);

/**
 * @brief Clear the ring buffer (remove all data).
 *
 * Resets the ring buffer to the empty state. All unread data is discarded.
 *
 * @param rb Pointer to the ring buffer structure.
 */
void se_ringbuf_clear(se_ringbuf_t *rb);

#ifdef __cplusplus
}
#endif
