#include "se_proto.h"

void se_proto_write(se_message_t *msg)
{
    uint8_t buf[32];
    uint8_t index = 0;

    if (msg == NULL)
    {
        return;
    }

    buf[index++] = msg->message_type;
    switch (msg->message_type)
    {
    case 0:
        buf[index++] = msg->body.protocol.sync & 0xFF;
        buf[index++] = (msg->body.protocol.sync >> 8) & 0xFF;
        buf[index++] = (msg->body.protocol.sync >> 16) & 0xFF;
        buf[index++] = (msg->body.protocol.sync >> 24) & 0xFF;
        buf[index++] = msg->body.protocol.version & 0xFF;
        buf[index++] = (msg->body.protocol.version >> 8) & 0xFF;
        buf[index++] = (msg->body.protocol.version >> 16) & 0xFF;
        buf[index++] = (msg->body.protocol.version >> 24) & 0xFF;
        buf[index++] = msg->body.protocol.flags & 0xFF;
        buf[index++] = (msg->body.protocol.flags >> 8) & 0xFF;
        buf[index++] = (msg->body.protocol.flags >> 16) & 0xFF;
        buf[index++] = (msg->body.protocol.flags >> 24) & 0xFF;
        buf[index++] = msg->body.protocol.crc & 0xFF;
        buf[index++] = (msg->body.protocol.crc >> 8) & 0xFF;
        buf[index++] = (msg->body.protocol.crc >> 16) & 0xFF;
        buf[index++] = (msg->body.protocol.crc >> 24) & 0xFF;
        break;

    case 1:
        buf[index++] = msg->body.timesync.time & 0xFF;
        buf[index++] = (msg->body.timesync.time >> 8) & 0xFF;
        buf[index++] = (msg->body.timesync.time >> 16) & 0xFF;
        buf[index++] = (msg->body.timesync.time >> 24) & 0xFF;
        buf[index++] = (msg->body.timesync.time >> 32) & 0xFF;
        buf[index++] = (msg->body.timesync.time >> 40) & 0xFF;
        buf[index++] = (msg->body.timesync.time >> 48) & 0xFF;
        buf[index++] = (msg->body.timesync.time >> 56) & 0xFF;
        break;

    case 2: // Observation message
        buf[index++] = msg->body.observation.time & 0xFF;
        buf[index++] = (msg->body.observation.time >> 8) & 0xFF;
        buf[index++] = (msg->body.observation.time >> 16) & 0xFF;
        buf[index++] = (msg->body.observation.time >> 24) & 0xFF;
        buf[index++] = (msg->body.observation.time >> 32) & 0xFF;
        buf[index++] = (msg->body.observation.time >> 40) & 0xFF;
        buf[index++] = (msg->body.observation.time >> 48) & 0xFF;
        buf[index++] = (msg->body.observation.time >> 56) & 0xFF;
        buf[index++] = msg->body.observation.tag & 0xFF;
        buf[index++] = (msg->body.observation.tag >> 8) & 0xFF;
        buf[index++] = (msg->body.observation.tag >> 16) & 0xFF;
        buf[index++] = (msg->body.observation.tag >> 24) & 0xFF;
        buf[index++] = msg->body.observation.value & 0xFF;
        buf[index++] = (msg->body.observation.value >> 8) & 0xFF;
        buf[index++] = (msg->body.observation.value >> 16) & 0xFF;
        buf[index++] = (msg->body.observation.value >> 24) & 0xFF;
        buf[index++] = (msg->body.observation.value >> 32) & 0xFF;
        break;

    default:
        // Handle unknown message type
        break;
    }

    printf("Writing message of type %d with %d bytes\n", msg->message_type, index);
}
