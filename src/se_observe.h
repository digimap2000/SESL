
#pragma once

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C"
{
#endif

    /**
     * @brief Get the current system time in nanoseconds.
     *
     * This weak symbol should be overridden by the user to provide high-resolution
     * timestamps suitable for event tracing. Typically sourced from a DWT cycle counter,
     * high-resolution timer peripheral, or external RTC with sub-microsecond precision.
     */
    __attribute__((weak)) uint64_t se_time_now_ns(void);

    void se_observe(uint32_t tag, uint64_t value);

#ifdef __cplusplus
}
#endif
