# periodic-ec2-stop

A EC2 Lambda function who stops all EC2 instances which:
- run more than 12 hours
- does **not** have a tag with Key: 'keep', Value: 'alive'

## build
npm install
zip -r periodic-ec2-stop.zip *

## deploy
- Upload the zip file to EC2 Lambda.
- Make sure the function have enough privileges to stop instances.


# **Use at your own risk!**

