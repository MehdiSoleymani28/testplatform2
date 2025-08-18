@echo off
cd /d %~dp0
mysql -u testp -p testp < database\create_tables.sql
pause
