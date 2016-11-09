#!/bin/sh

# APP所在路径
APP_PATH=../AMapiPhone.app
# 执行脚本所在目录
RUN_SCRIPT_PATH=`pwd`
# 工程目录
WORKSPACE=${RUN_SCRIPT_PATH}/..
# 源码路径
SRC_PATH=${RUN_SCRIPT_PATH}/../src
# 日志目录
OUTPUT_PATH=${RUN_SCRIPT_PATH}/../output
# 用例目录
CASE_PATH=${SRC_PATH}
# 数据目录
DATA_PATH=${SRC_PATH}
# 是否重置app
IS_RESET_APP=0

# 执行用例类型
CASE_TYPE=${1}
# 报告链接前缀
OUTPUT_LINK=${2}

# 检查设备连接
if [ `python MobileDevice/ list | wc -l` -lt 2 ];then
    echo -e "\033[41;36m 无连接的设备 \033[0m"
    exit 1
fi

# 检查参数
if [ $# -lt 2 ]; then
    echo "please input the parameter. "
    echo "sh runFuntionsTest3.sh alltest(TestType) ."
    exit 1
fi

#清除环境
rm -rf ${OUTPUT_PATH}
mkdir ${OUTPUT_PATH}

echo $(date +%s ) >${OUTPUT_PATH}/start_time

# 重置app, 删除APP Document目录
function reset_app() {
    echo "开始重置app"
    bundle_id=`/usr/libexec/PlistBuddy -c "print CFBundleIdentifier" ${APP_PATH}/Info.plist`

    python MobileDevice/ afc -a ${bundle_id} rmdir /Documents
    if [ $? -ne 0 ];then
        echo -e "\033[41;36m 重置app失败 \033[0m"
        exit 3
    fi
    sleep 2
    echo "结束重置app"
}

# 运行单个用例
function run_case() {

    # 判断是否需要重置app
    if [ ${IS_RESET_APP} != 0 ];then
        echo "该用例需要先重置app, 即删除Documents目录"
        reset_app
    fi

    case_file=$1
    case_name=$(basename ${case_file} .js)

    log_file=${OUTPUT_PATH}/${case_name}_log.txt
    xml_file=${OUTPUT_PATH}/${case_name}.xml
    shot_file=${OUTPUT_PATH}/${case_name}_shot.png
    case_shot_file=${OUTPUT_PATH}/${case_name}_shot_test

    instrument_trace=${OUTPUT_PATH}/instrumentscli0.trace
    instrument_log=${OUTPUT_PATH}/Run\ 1

    # 删除老的Instruments遗留目录（包括instrumentscli* 和 Run*）
    rm -rf ${OUTPUT_PATH}/instrumentscli*.trace
    rm -rf ${OUTPUT_PATH}/Run*

    # 开始执行用例
    cd ${RUN_SCRIPT_PATH}
    ./test_runner/run ${APP_PATH} ${case_file} ${OUTPUT_PATH} -d dynamic -x -s 60 > ${log_file} 2>&1
    sleep 1

    # 执行结束后，如果执行失败，将失败截图获取出来
    for shotFile in $(ls "${instrument_log}/" | grep 'amap_ios_.*.png')
    do
        cp "${instrument_log}/${shotFile}" "${shot_file}"
    done

}

# 执行测试用例列表
function run_case_list() {

    case_list=$1

    cat ${case_list} > ${RUN_SCRIPT_PATH}/CaseList1

    for ((i=1;i<4;i++))
    do
        cp -r ${DATA_PATH}/Data$i.js ${DATA_PATH}/Data.js

        cd ${RUN_SCRIPT_PATH}
        # ant -f ant_build_file/build.xml

        echo '===== Run Test On Data Set '$i' ====='
        caseFile=${RUN_SCRIPT_PATH}/CaseList$i
        nextCaseFile=./CaseList$((i+1))
        echo > ${nextCaseFile}

        index=1
        for file in `cat $caseFile`
        do

            echo "****${index} -- start run case: ${file}"
            run_case ${file}

            case_name=$(basename $file .js)

            log_name=${OUTPUT_PATH}/${case_name}_log
            shot_name=${OUTPUT_PATH}/${case_name}_shot
            xml_name=${OUTPUT_PATH}/${case_name}.xml

            failNum=$(($((`cat ${xml_name}|grep 'failures="1"'|wc -l`))+$((`cat ${xml_name}|grep 'failures="0"' |grep 'tests="0"'|wc -l`))))
            if [ $failNum -gt 0 ]; then
                echo ${file} >> $nextCaseFile
                echo "fail"
            fi

            # 将日志备份
            mv ${log_name}.txt ${log_name}$i.txt
            if [ -f ${shot_name}.png ]; then
                mv ${shot_name}.png ${shot_name}$i.png
            fi
    #		mv "${xmlname}.xml" "${xmlname}$i.xml"

            echo "=====end run case"
            index=`expr $index + 1`
        done
    done


    instrumentTrace=${OUTPUT_PATH}/instrumentscli0.trace
    instrumentLog=${OUTPUT_PATH}/Run\ 1

    # 删除老的Instruments遗留目录（包括instrumentscli* 和 Run*）
    for oldTrace in $(ls ${OUTPUT_PATH} | grep 'instrumentscli.*.trace')
    do
        rm -rf "${OUTPUT_PATH}/$oldTrace"
    done
    ls ../output | grep 'Run.*' | while read oldLog
    do
        rm -rf "${OUTPUT_PATH}/$oldLog"
    done

}
# 开始执行任务
function run_auto_task() {
    run_case_path=$1
    # 生成case列表
    find ${run_case_path} -name "TC*.js" > caselist

    # 将脚本拷贝到output
    for file in `cat caselist`
    do
        cp $file ${OUTPUT_PATH}
    done

    # 开始执行用例
    run_case_list caselist

    echo $(date +%s ) >${OUTPUT_PATH}/end_time

    echo '===== Generate Html Report ====='
    sh ./summary.sh ${OUTPUT_LINK}
    python resultParser/generateAutoReport.py -o ${OUTPUT_PATH}/AutoTestResult.html -x ${OUTPUT_PATH}/summaryResult.xml
    echo '===== Generate Html Report End ====='
}

#判断执行用例类型c
# coretest
if [ $1 = 'alltest' ]; then
    echo '===== alltest start ====='
    run_case_path=${SRC_PATH}/cases
    DATA_PATH=${SRC_PATH}/data

    run_auto_task ${run_case_path}

    echo '===== alltest End ====='
else
    echo '===== other autotest start ====='

    run_case_path=${SRC_PATH}/cases/$1
    DATA_PATH=${SRC_PATH}/data

    if [ ! -d ${CASE_PATH} ]; then
        echo "制定的case类型不存在"
        exit 1
    fi

    if [ ${CASE_TYPE} = "offlineMap" ];then
        IS_RESET_APP=1
    fi

    run_auto_task ${run_case_path}

    echo '===== other autotest end ====='
fi