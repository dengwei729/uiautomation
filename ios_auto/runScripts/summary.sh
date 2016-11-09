#!/bin/sh
# 汇总执行结果

# 定义
RUN_SCRIPT_PATH=`pwd`
WORKSPACE=${RUN_SCRIPT_PATH}/..
SRC_PATH=${RUN_SCRIPT_PATH}/../src
OUTPUT_PATH=${RUN_SCRIPT_PATH}/../output
START_TIME=`cat ${OUTPUT_PATH}/start_time`
END_TIME=`cat ${OUTPUT_PATH}/end_time`


testcase_path=${OUTPUT_PATH}
data_path=${OUTPUT_PATH}

resultFile=summaryResult.xml

#参数是这次构建的地址，形如： http://ns.jenkins.baidu.com/job/mapmo_iphone_daily_autotest/130/
outputLinkPath=$1

dataGroupNum=3
dataPath=${data_path}/Data${dataGroupNum}.js
outputXMLFile=${OUTPUT_PATH}/${resultFile}

totalNum=0
failNum=0
unexeNum=0

# 打印detail里的log信息
function printLogs()
{
     for i in $(seq $dataGroupNum)
        do
            if [ -f ${OUTPUT_PATH}/${1}_log${i}.txt ];then
                if [  -f ${OUTPUT_PATH}/${1}_shot${i}.png ]; then
                    echo "        <log id=\"${1}_log${i}\" detailUrl=\"${outputLinkPath}/${1}_log${i}.txt\" screenShotUrl=\"${outputLinkPath}/${1}_shot${i}.png\"/>" >> ${outputXMLFile}
                else
                    echo "        <log id=\"${1}_log${i}\" detailUrl=\"${outputLinkPath}/${1}_log${i}.txt\" screenShotUrl=''/>" >> ${outputXMLFile}
                fi
            fi
        done
}

#建立新的结果数据文件
echo "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><result>" > ${outputXMLFile}

# 遍历目前所有xml文件
for xmlFile in $(ls ${OUTPUT_PATH}|grep 'TC.*\.xml')
do
    ((totalNum++))
    
    #用例名
    testcase_name=${xmlFile//.xml/}
    # 对应的xml文件
    xmlFilePath="${OUTPUT_PATH}/${xmlFile}"
    # 对应的测试文件
    testcase_script_path="${testcase_path}/${testcase_name}.js"
    # 对应用例执行日志
    logFile=${OUTPUT_PATH}/${testcase_name}'_log'$dataGroupNum'.txt'

    # 获取case所属模块和描述
    testcase_module=$(cat ${testcase_script_path}|grep "moduleid"|awk -F'moduleid:' '{print $2}' |awk -F"\"" '{print $1}')
    testcase_info=$(cat ${testcase_script_path}|grep "description"|awk -F'description:' '{print $2}' |awk -F"\"" '{print $1}')

    # 判断用例结果情况
	failWC=$(($(cat $xmlFilePath|grep 'failures="1"'|wc -l)))
	unexeWC=$(($(cat $xmlFilePath|grep 'failures="0"' |grep 'tests="0"'|wc -l)))

	testsuitMsg=$(cat $xmlFilePath|grep 'testsuite'|head -1)

    #获取用例执行时间:
    testsuitruntime=$(echo $testsuitMsg|sed 's/.*timestamp="\(.*\)\" time.*/\1/')
    testsuitruntime=$(echo $testsuitruntime|cut -c 1-4,6,7,9,10,12,13,15,16)

    #用例耗时
    testsuitconsumetime=0
    testsuitconsumetime=$(echo $testsuitMsg|sed 's/.*time="\([0-9.]*\)".*/\1/')
    testcae_status=""

    # 定义失败的一些属性
    failedActionName=""
    page=unknow
    action=unexpected
    failedActionName=""
    error_msg=""


    #找出fail的用例
    if [ $failWC -gt 0 ]; then

        ((failNum++))

        #找出错在哪一条操作
        failedActionLog=$(cat $xmlFilePath |grep 'Default'|tail -1|awk -F'Default:|\n|</failure>' '{print $2}')
        failedActionLog=${failedActionLog// /}

        # 错误信息
        error_msg=$(cat $xmlFilePath |awk -F"<" /Error/'{print $1}')
        if [ "${error_msg}" == "" ];then
            error_msg=$(cat $logFile |awk -F"Fail:" /Fail/'{print $2}')
        fi

        #初始化记录中间值的变量
        failedActionNameSplit=null
        flag=0

        #到测试文件中查找错在哪一条操作
        failedActionName=$(
        cat ${testcase_script_path} | while read line
        do
            #flag标记，表示已经找到错误行，即上一行是出错操作对应的log
            if [ $flag -eq 1 ];then
                echo $line
                break;
            fi

            #排查log,找到出错操作对应的log
            if [ $(echo $line|grep say |wc -l) -gt 0  ];then
                #拆出log 的内容
                logContain=$(echo $line|sed 's/.*say(\(.*\));.*/\1/')
                logContain=${logContain//[\"+]/}
                logContain=${logContain// /}

                #如果log里面有数据，需要从数据文件中读取数据，带入相应的位置
                if [  $(echo $line|grep 'test.*_input|.'|wc -l) -gt 0 ];then
                    #找出数据的名字，如：test1525963_check1，test1525963_input1
                    datakey=$(echo $line|sed 's/.*\(test.*_input.\).*/\1/')
                    #从数据文件读取具体的数据
                    dataValue=$(cat $dataPath |awk -F'= |"' /$datakey/'{print $3}')
                    #带入相应的位置
                    logContain=${logContain//"$datakey"/"$dataValue"}
                fi

                #如果log内容符合，flag标记，表示已经找到错误行
                [[ "$logContain" =~ "$failedActionLog" ]] && flag=1]
            fi
        done
        )

        #分解出错的操作名称，拆分成page和action两部分
        failedActionNameSplit=${failedActionName%%(*}
        failedActionNameSplit=${failedActionNameSplit//./ }

        index=0
        #如果有函数名称中没有下划线，那么函数名称整体作为action,page设为basic,认为该操作不属于某个指定页面
        for element in $failedActionNameSplit
        do
            if [ $index -eq 1 ];then
                action=$element

            fi
            if [ $index -eq 0 ];then
                page=$element
            fi
            ((index++))
        done

        testcae_status="2"

	#找出未执行的用例
	elif [ $unexeWC -gt 0 ]; then
        ((unexeNum++))
        testcae_status="1"

    #成功的用例
    else
        isReady=1
        testcae_status="0"
	fi

    #记录该条用例相关的错误信息
    echo "<testcase info='${testcase_info}' module='${testcase_module}' name='${testcase_name}' runresult='${testcae_status}' consumetime=\"${testsuitconsumetime}\" runtime=\"${testsuitruntime}\" script_path='${outputLinkPath}/${testcase_name}.js' >">> ${outputXMLFile}
    echo "    <detail failed_page=\"${page}\" failed_action=\"${action}\" action_name='${failedActionLog}' errorMsg='${error_msg}' >">> ${outputXMLFile}
    
    #记录该条用例对应的log结果:txt和png
    printLogs ${testcase_name}
    echo "    </detail>" >> ${outputXMLFile}

    echo "</testcase>" >> ${outputXMLFile}

	passNum=$(($totalNum - $failNum - $unexeNum))
done
#>/dev/null
sabiltityrate=$(echo "scale=0; 100*${passNum}/${totalNum}" |bc)%

exeTime=$((${END_TIME} - ${START_TIME}))
exeTime=$(echo "scale=0; ${exeTime}/60" |bc)
runtime=$(date +%Y)$(echo ${START_TIME}|cut -c 3-10)
#    testsuitruntime=$(echo $testsuitruntime|cut -c 1-4,6,7,9,10,12,13,15,16)

if [ $totalNum -eq 0 ];then
    result="build failed"
    else
    result="build successed"
fi
if [ $failNum -gt 0 ];then
    describe=unstable
else
    describe=stable
fi
timestamp=$(date +%Y%m%d%H%M)
echo "<total result=\"${result}\" consume_time='${exeTime}' sabiltityrate=\"${sabiltityrate}\" totalcasenum=\"${totalNum}\" failedcasenum=\"${failNum}\" passcasenum=\"${passNum}\" unexecuted=\"${unexeNum}\" ws=\"${1}\" timestamp=\"${timestamp}\" describe=\"${describe}\" runtime=\"${runtime}\"/>" >> ${outputXMLFile}
echo "</result>" >> ${outputXMLFile}
