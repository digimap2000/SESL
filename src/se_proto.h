
#pragma once

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C"
{
#endif

    typedef struct
    {
        uint32_t sync;
        uint32_t version;
        uint32_t flags;
        uint32_t crc;
    } se_message_protocol_t;

    typedef struct
    {
        uint64_t time;
    } se_message_timesync_t;

    typedef struct
    {
        uint64_t time;
        uint32_t tag;
        uint32_t value;
    } se_message_observation_t;

    typedef struct
    {
        uint8_t message_type;
        union
        {
            se_message_protocol_t protocol;
            se_message_timesync_t timesync;
            se_message_observation_t observation;
        } body;
    } se_message_t;

    void se_proto_write(se_message_t *msg);

#ifdef __cplusplus
}
#endif
