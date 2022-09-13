一. Features

    1. Sign up and Login
    
       1) Register new users
       
       2) Two types of users: Standard, administrator
       
    2. Features for standard users:
       1) Create automated test tasks
          Upload Android apps to test their performance and stability metric values

       2) Maintain own account and setting information

       3) Dashboard 
          I) A overview of performance and stability ranking of tested Android apps
          II) Check and download test results
          
    3. Features for administrators:
        1) Dashboard 
          I) A overview of performance and stability ranking of tested Android apps
          II) Check and download test results of all standard users
          III) a overview of usage count of Android devices

        2) Maintain own account and setting information

        3) Android device management
           Stop or restart Android devices
    
二. Installing
   1. MongoDB
   	  1) install MongoDB Compass
          https://docs.mongodb.com/v4.0/installation/
   	  2) instruction for creating the database: database_instruction.txt

   2. Firebase database
      1) instruction: https://firebase.google.com/docs

      2) fill out the file 'material-kit-react-main/src/config/fbConfig.js'

   3. Back end
      Under 'express-file-master' folder:
      Execute 'npm install' command to install all dependencies

   4. Front end
      Under 'material-kit-react-main' folder:
      Execute 'npm install' command to install all dependencies

   5. Automated scripts: 
      install Python 3.7.6:
      https://www.python.org/downloads/


三. Run
   1. MongoDB
      Under '[MongoDB installation path]/bin' folder:
      Execute './mongod' command
      Instruction: https://docs.mongodb.com/manual/reference/program/mongod/

   2. Back end:
   	  Under 'material-kit-react-main' folder:
   	  Execute 'npm start' command

   3. Front end:
   	  Under 'material-kit-react-main' folder:
   	  Execute 'npm start' command

   4. Connect to an Android device
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
