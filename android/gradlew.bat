@echo off
set APP_DIR=%~dp0
if defined JAVA_HOME (set JAVA_EXEC=%JAVA_HOME%\bin\java.exe) else (set JAVA_EXEC=java.exe)
"%JAVA_EXEC%" -classpath "%APP_DIR%gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
