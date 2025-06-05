cmake_minimum_required(VERSION 3.10)
project(SELS_RingBuffer_Test C)

# Enable more warnings for safety
set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)
add_compile_options(-Wall -Wextra)

include_directories(src/ringbuf)

# For debug symbols
set(CMAKE_BUILD_TYPE Debug)

# Add source files
set(RINGBUF_SOURCES
    src/ringbuf/se_ringbuf.c
    src/ringbuf/se_ringbuf.h
)

set(TEST_SOURCES
    test/test_se_ringbuf.c
)

# Define the test executable
add_executable(ringbuf_test
    ${RINGBUF_SOURCES}
    ${TEST_SOURCES}
)

# If you need to link other libraries (e.g. m for math), do it here:
# target_link_libraries(ringbuf_test m)
