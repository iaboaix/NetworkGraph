"""
* @project: NetworkGraph
* @file: uglify.py
* @author: dangzhiteng
* @email: 642212607@qq.com
* @date: 2019.5.14
"""
import os
files = os.listdir(".")
uglify_files = []
for file in files:
	if os.path.isdir(file):
		continue
	s_file = file.split(".");
	if s_file[-1] == "js" and s_file[-2] != "min":
		uglify_files.append(file)
for file in uglify_files:
	os.system("uglifyjs {0} -m -o {1}".format(file, file.split(".")[0] + ".min.js"))