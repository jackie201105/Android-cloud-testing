This project is a cloud-based Android app testing platform that provides users with
automated testing services including performance and stability evaluation. The
platform offers users a wide range of Android devices for automation evaluation,
which helps them to conduct comprehensive testing of their Android apps on
different devices. Additionally, with the help of comprehensive test reports provided
by the platform, users can identify gaps between different apps, as well as know key
areas requiring improvement. Finally, this platform helps users to effectively evaluate
their small-scale Android applications on performance and stability metrics in an
economic way.

1. Architecture


2. Features

    2.1 Sign up and Login
    
       1) Register new users
       
       2) Two types of users: Standard, administrator
       
    2.2 Features for standard users:
       1) Create automated test tasks
          Upload Android apps to test their performance and stability metric values

       2) Maintain own account and setting information

       3) Dashboard 
          I) A overview of performance and stability ranking of tested Android apps
          II) Check and download test results
          
    2.3 Features for administrators:
        1) Dashboard 
          I) A overview of performance and stability ranking of tested Android apps
          II) Check and download test results of all standard users
          III) a overview of usage count of Android devices

        2) Maintain own account and setting information

        3) Android device management
           Stop or restart Android devices
    
3. Installing
   3.1 MongoDB
   	  1) install MongoDB Compass
          https://docs.mongodb.com/v4.0/installation/
   	  2) instruction for creating the database: database_instruction.txt

   3.2 Firebase database
      1) instruction: https://firebase.google.com/docs

      2) fill out the file 'material-kit-react-main/src/config/fbConfig.js'

   3.3 Back end
      Under 'express-file-master' folder:
      Execute 'npm install' command to install all dependencies

   3.4 Front end
      Under 'material-kit-react-main' folder:
      Execute 'npm install' command to install all dependencies

  3.5 Automated scripts: 
      install Python 3.7.6:
      https://www.python.org/downloads/


4. Run
   4.1 MongoDB
      Under '[MongoDB installation path]/bin' folder:
      Execute './mongod' command
      Instruction: https://docs.mongodb.com/manual/reference/program/mongod/

   4.2 Back end:
   	  Under 'material-kit-react-main' folder:
   	  Execute 'npm start' command

   4.3 Front end:
   	  Under 'material-kit-react-main' folder:
   	  Execute 'npm start' command

   4.4 Connect to an Android device
      1) connect the device with a data cable
         adb tcpip 5555  
         python -m uiautomator2 init
         instruction: https://appium.io/docs/en/drivers/android-uiautomator2/

      2) the device connects to a valid wifi hotspot

      3) python -m weditor
         On the weditor user interface
           I) input 'the wifi address' textbox with the wifi address of the device
           II) click the 'connect' button
         instruction: https://pypi.org/project/weditor/
