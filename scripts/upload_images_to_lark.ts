import * as fs from 'fs';
import * as lark from "@larksuiteoapi/node-sdk";

const client = new lark.Client({
  appId: process.env.LARK_APPID || "",
  appSecret: process.env.LARK_SECRET || "",
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu,
});


// 获取启动时带的参数
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: npm run upload_images_to_lark <directory>');
  process.exit(1);
}

// 读取目录下的所有文件
const directory = args[0];
fs.readdir(directory, (err, files) => {
  if (err) {
    console.error(`Unable to read directory: ${directory}`);
    process.exit(1);
  }

  // 过滤出所有图片文件
  const imageFiles = files.filter(file => {
    const extension = file.split('.').pop()?.toLowerCase();
    return extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif';
  });

  // 输出所有图片文件的文件名
  console.log('Image files in directory:');
  [imageFiles[0]].forEach(file => {
    console.log(file);
    const buffer = fs.readFileSync(directory + "/" + file);
    //console.log(buffer);
    client.im.image.create({
      "data": {
        "image_type": "message",
        "image": buffer,
      }
    }).then(res => {
      console.log(res);
    }).catch(err => console.log("errorrrrrrrr", err))
  });
});

