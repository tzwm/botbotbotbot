require 'net/http'
require 'json'


dir_path = ARGV[0]  # 从命令行参数中获取目录路径

def get_access_token
  url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'
  uri = URI(url)
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  req = Net::HTTP::Post.new(uri.request_uri, 'Content-Type' => 'application/json')
  req.body = {
    app_id: ENV['LARK_APPID'],
    app_secret: ENV['LARK_SECRET']
  }.to_json
  res = http.request(req)
  JSON.parse(res.body)['tenant_access_token']
end

def upload_image(file)
  access_token = get_access_token

  #tempfile = Down.download(img_url)

  uri = URI('https://open.feishu.cn/open-apis/im/v1/images')
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  req = Net::HTTP::Post.new(uri, 'Content-Type' => 'multipart/form-data')
  req['Authorization'] = "Bearer #{access_token}"
  form_data = [
    ['image_type', 'message'],
    ['image', file]
  ]
  req.set_form(form_data, 'multipart/form-data')
  res = http.request(req)


  JSON.parse(res.body)['data']['image_key']
end


Dir.glob(File.join(dir_path, '**/*.{png,jpg,jpeg,gif,bmp}')) do |filename|
  puts(filename)
  f = File.read(filename)
  ret = upload_image(f)
  puts(ret)
end
