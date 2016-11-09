#coding=utf-8
'''
Created on 2013-7-15

@author: dengwei
'''
import os
import argparse
import traceback
import pprint
from template import Template as MicroTemplate

import sys 
reload(sys)  
sys.setdefaultencoding('utf8')  

try: 
    import xml.etree.cElementTree as ET
except ImportError: 
    import xml.etree.ElementTree as ET

template_dir = os.path.join(os.path.dirname(__file__), 'templates')
template_file = "report_ios_auto.html"

FAILED = "2"
UNEXE = "1"
PASSED = "0"

def read_html(p_template_dir,p_template_file):
    html_file_path = os.path.join(p_template_dir, "%s" % p_template_file)
    with open(html_file_path) as html_file:
        html = html_file.read()
    return html

def generateReport(resultStr, output):
    "生成报告"
    template_content = read_html(template_dir, template_file)
    rendered = MicroTemplate(template_content).render(**resultStr)
    
    resultPath = os.path.join(output)
    file(resultPath, 'w').write(rendered)

class TestCase(dict):
    """测试用例报告信息"""
    def __init__(self):
        dict.__init__(self)

        self.name = ""
        self.module = ""
        self.info = ""
        self.status = ""

        self.consume_time = ""
        self.excute_time = ""

        # 失败的一些属性
        self.action = ""
        self.action_name = ""
        self.page = ""

        self.script_path = ""
        self.log_list = []

    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError, k:
            raise AttributeError, k
  
    def __setattr__(self, key, value):
        self[key] = value

    def set_case_info(self, case_info):
        self.name = case_info.get("name")
        self.module = case_info.get("module")
        self.info = case_info.get("info")
        self.status = case_info.get("runresult")
        self.consume_time = case_info.get("consume_time")
        self.script_path = case_info.get("script_path")

        detail = case_info.find("detail")
        self.action = detail.get("failed_action")
        self.action_name = detail.get("action_name")
        self.page = detail.get("failed_page")
        self.error_msg = detail.get("errorMsg")
        
        for log_info in detail.findall("log"):
            log = {
                "log_path": log_info.get("detailUrl"),
                "shot_path": log_info.get("screenShotUrl")
            }
            self.log_list.append(log)
            
        # 补齐3次执行
        for index in range(len(self.log_list), 3):
            log = {
                "log_path": "",
                "shot_path": ""
            }
            self.log_list.append(log)

class Task(dict):
    """任务类"""
    def __init__(self):
        dict.__init__(self)
        self.excute_time = ""
        self.consume_time = ""

        self.total_case_num = ""
        self.fail_case_num = 0
        self.unexe_case_num = 0
        self.pass_case_num = 0

        self.sabiltity_rate = ""

        self.fail_testcase = []
        self.unexe_testcase = []
        self.pass_testcase = []

    def set_total_info(self, total_info):
        "设置整体任务信息"
        self.excute_time = total_info.get("runtime")
        self.consume_time = total_info.get("consume_time")

        self.total_case_num = total_info.get("totalcasenum")
        self.fail_case_num = total_info.get("failedcasenum")
        self.unexe_case_num = total_info.get("unexecuted")
        self.pass_case_num = total_info.get("passcasenum")

        self.sabiltity_rate = total_info.get("sabiltityrate")

    def set_case_info(self, case_list):
        "设置testcase信息"
        for case_info in case_list:
            case_obj = TestCase()
            case_obj.set_case_info(case_info)
            if case_obj.status == FAILED:
                self.fail_testcase.append(case_obj)
            elif case_obj.status == UNEXE:
                self.unexe_testcase.append(case_obj)
            else:
                self.pass_testcase.append(case_obj)

    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError, k:
            raise AttributeError, k
  
    def __setattr__(self, key, value):
        self[key] = value

def main(output_file, xml_path):
    "程序主入口"
    try: 
        tree = ET.parse(xml_path)     #打开xml文档 
        #root = ET.fromstring(country_string) #从字符串传递xml 
        root = tree.getroot()         #获得root节点  
    except Exception, e:
        print traceback.print_exc()
        sys.exit(1) 

    try:
        task = Task()
        task.set_total_info(root.find("total"))
        task.set_case_info(root.findall("testcase"))

        generateReport(task, output_file)

    except Exception, e:
        traceback.print_exc()
    else:
        pass
    finally:
        pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='自动化报告生成.')

    parser.add_argument('-o', '--output_file', help='指定输出路径')
    parser.add_argument('-x', '--xml_file', help='xml文件')
    
    arguments = parser.parse_args()

    if not arguments.output_file or not arguments.xml_file:
        print 'Nothing to do.'
        sys.exit(1)
    else:
        main(arguments.output_file, arguments.xml_file)
