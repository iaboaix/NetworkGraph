import re
import requests

# 文章名 作者 被引量 发表年份 
# {
#     'title': xxx,
#     'author': xxx,
#     'count': xxx,
#     'published_year': xxx,
#     'cited_frequency': xxx,
# }
# test = 'http://xueshu.baidu.com/usercenter/paper/search?_token=d03fdc4c456bd269dddc2d110cfff7dcbd769c563de0f203d4771f8e98d86a9f&_ts=1548202605&_sign=614a7bfb2de3233b43139ab66d2769a7&wd=refpaperuri%3A(884c76ec3ad429bd3a15a91b8700a18e)&type=citation&rn=10&page_no=100'
# url = r'http://xueshu.baidu.com/s?wd=%E9%80%9A%E4%BF%A1&ie=utf-8&tn=SE_baiduxueshu_c1gjeupa&sc_from=&sc_as_para=sc_lib%3A&rsv_sug2=0'
headers = { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
			'Accept-Encoding': 'gzip, deflate',
			'Accept-Language': 'zh-CN,zh;q=0.9',
			'Cache-Control': 'max-age=0',
			'Connection': 'keep-alive',
			'Cookie': 'Ecp_ClientId=8190123090300518126; ASP.NET_SessionId=vtfgnzug5v2b3r01o3mzcolk; SID_kns=011114; cnkiUserKey=0d154fa5-21a5-4ba6-0a27-d0f40219f4fc; SID=011104; KNS_DisplayModel=listmode@SCDB; RsPerPage=50; _pk_ref=%5B%22%22%2C%22%22%2C1548294701%2C%22http%3A%2F%2Fwww.cnki.net%2F%22%5D; _pk_ses=*; Ecp_IpLoginFail=190124119.103.15.41; KNS_SortType=CFLS%21%28%25e8%25a2%25ab%25e5%25bc%2595%25e9%25a2%2591%25e6%25ac%25a1%252c%2527INTEGER%2527%29+desc',
			'Host': 'nvsm.cnki.net',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.10 Safari/537.36'}
def main():
	url = 'http://nvsm.cnki.net/kns/brief/brief.aspx?curpage={0}&RecordsPerPage=50&QueryID=1&ID=&turnpage=1&tpagemode=L&dbPrefix=CFLS&Fields=&DisplayMode=listmode&PageName=ASP.brief_default_result_aspx&sKuaKuID=1&isinEn=1#J_ORDER&'
	pattern = re.compile('<TR.*?</TR>', re.S)
	for i in range(120):
		cur_url = url.format(i + 1)
		html = requests.get(cur_url, headers = headers).text
		items = pattern.findall(html)
		for item in items:
			parser_item(item)


# 将 item 解析，返回 [序号，标题，作者，来源，发表时间，被引次数，下载次数]
num_pattern = re.compile(r'(?<=onclick\=\"checkMark\(this\)\"  >)\d+(?=</td>)')
title_pattern = re.compile(r"(?<=target=\'_blank\'>).*?(?=</a>)")
# author_pattern = 
# source_pattern = 
# published_time_pattern = 
# cited_frequency_pattern = 
def parser_item(item):
	num = num_pattern.search(item).group()
	title = title_pattern.search(item).group()
	title = re.sub('<.*?>', '', title)
	print(num, title)
	# return [nums, title, author, source, published_year, cited_frequency]


if __name__ == '__main__':
	main()