

# Project Title

A document consumer consisting of a filesystem watcher and queue service, parser, and CSV writer for ingesting JSM Control Valve Specification Sheet

## Running

```
$ node src/queue.js

```
add a file to targeted input directory

### Prerequisites

Node JS 11+

Required Environemntal Variables

```
$INPUT_SOURCE_PATH
$CSV_OUTPUT_PATH
$RUN_LOG_DIR
$RUN_LOG_FILE
$ERROR_LOG_DIR
$ERROR_LOG_FILE
```


### Installing
```
$ git clone
```
```
$ node src/startEnvironment.js
```
startEnvironment creates 

csv-output, where our generated csv files will be written

$CSV_OUTPUT_PATH=ETC-TC-DSTD-GOM-MQP/csv-output

error-log, which will record the filename and generated error in a logfile in case of parser failure

assign
$ERROR_LOG_DIR=ETC-TC-DSTD-GOM-MQP/error-log

to this path


$ERROR_LOG_FILE=ETC-TC-DSTD-GOM-MQP/error-log/errorLogJSM.txt

target a .txt file as log. Will be created if path is named

input, where target files are consumed for parsing
$INPUT_SOURCE_PATH=ETC-TC-DSTD-GOM-MQP/input

runLog, where a log of files that have been parsed are stored, along with all extracted information is written


assign
$RUN_LOG_DIR=ETC-TC-DSTD-GOM-MQP/runLog


$RUN_LOG_FILE=ETC-TC-DSTD-GOM-MQP/runLog/runLogJSM.txt

target a .txt file as log. Will be created if path is named

add these 4 paths to your Environmental variables, or to a .env file in development
