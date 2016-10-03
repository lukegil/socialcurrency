#!/usr/bin/python
import os, sys
import ConfigParser, re
import requests

def download_easylist():
    ''' Download easylist.txt and return txt'''

    cnf = ConfigParser.RawConfigParser()
    cur_dir = os.path.dirname(os.path.realpath(__file__))
    cnf.readfp(open("{}/config.conf".format(cur_dir)))
    dl_url = cnf.get("ETL", "easylist_url")

    r = requests.get(dl_url)

    return r.text


def parse_easylist_line(line):
    ''' Return a string based on easylist markup

        markup rules can be found here: https://adblockplus.org/en/filters#basic
    '''
    line = line.strip()

    # remove anything after $
    line = line.split("$")[0]



    # currently not dealing with wildcard chars
    if ("*" in line):
        s = line.split("*")
        if (len(s[0]) >= len(s[1])):
            line = s[0]
        else:
            line = s[1]

    # currently not dealing with "|" or "||"
    if ("|" in line):
        s = line.split("|")
        l = 0
        for k in s:
            kl = len(k)
            if kl > l:
                line = k
                l = kl

    # currently not dealing with '^'
    if ("^" in line):
        s = line.split("^")
        l = 0
        for k in s:
            kl = len(k)
            if kl > l:
                line = k
                l = kl

    # lazy with selectors
    if (line[:2] == "##"):
        line = line[2:]
        if (line[0] in [".", "#"]):
            line = line[1:]
        brack = line.find("[")
        if (brack > -1):
            s = re.split("[|]", line)
            q = ""
            for el in s:
                k = el.split("\"")
                for sub in k:
                    if len(sub) > len(q):
                        q = sub
            line = q

    # remove trailing non-alphanumerics
    if (not line[-1].isalnum()): line = line[:-1]

    return line


def parse_easylist(txt):
    '''retrieve sections from easylist.txt. List set in config.conf'''

    txt = txt.split("\n")

    cnf = ConfigParser.RawConfigParser()
    cur_dir = os.path.dirname(os.path.realpath(__file__))
    cnf.readfp(open("{}/config.conf".format(cur_dir)))
    i = cnf.items("ETL_easylist_sections")
    file_headers = [x[1] for x in i]

    in_section = False
    easylist = []
    for line in txt:

        if ("! ***" in line):
            if (sum([True for x in file_headers if x in line]) > 0):
                in_section = True
            else:
                in_section = False
        elif (line and line[0] == "!"): # comments
            continue
        elif (in_section):
            line = parse_easylist_line(line)
            if (line.strip()):
                easylist.append(line)
    return easylist

t = download_easylist()
l = parse_easylist(t)
for i in l:
    print i
