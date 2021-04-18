<template>
  <div class="home">
    <div style="display:flex;align-items:center;width:100%;height:60px;margin-bottom:10px;line-height:60px;padding-left:20px;color:#fff;background:#303133;">
      <img  style="width:50px;margin-right:10px;" :src="logoUrl"/>
      <h3>EasySearch位置搜索神器</h3>
    </div>
    <el-form :inline="true" class="demo-form-inline"> 
        <el-form-item label="搜索范围">
           <el-cascader size="medium" :props="props" @change="onChange"></el-cascader>
        </el-form-item>
         <el-form-item label="搜索关键字">
           <el-input v-model="keyword" placeholder="请输入搜索关键字"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" round @click="refreshPage">刷新</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" round @click="setFormVisible = true">API设置</el-button>
        </el-form-item>
</el-form>


    <el-dialog title="设置" :visible.sync="setFormVisible">
      <el-form >
        <el-form-item label="腾讯APIKey" label-width="120px">
          <el-input v-model="key" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="onSetSubmit">确 定</el-button>
      </div>
    </el-dialog>

    
    <!-- <el-card   class="box-card info" >
      <div slot="header" class="clearfix">
        <span>已搜索范围</span>
      </div>
      <el-tag style="margin:0 4px;"
        v-for="item in all"
        :key="item"
        type="success"
        effect="dark">
          {{ item }}
      </el-tag>
    </el-card>

    <el-card class="box-card info" style="margin-top:8px;">
       <div slot="header" class="clearfix">
        <span>正在搜索范围</span>
      </div>
      <el-tag style="margin:0 4px;"
        v-for="(item,index) in sort"
        :key="index"
        type="danger"
        effect="dark">
          <span>{{ item.city }} {{ '第' + item.page + '页'}}</span>
      </el-tag>
    </el-card> -->
 
 
 
    
    <el-card class="box-card" style="margin-top:8px;">
       <div slot="header" class="clearfix">
           <span>搜索结果</span>
          <el-button style="float: right;" type="primary" @click="saveWithExcel" >保存为Excel</el-button>
           <span style="float: right;
              margin-top: 8px;
              font-size: 14px;
              margin-right: 10px;">已搜索到 {{list.length}} 条结果</span>
      </div>
      <el-table id="table"
        :data="list"
        size="mini"
        border
        style="width: 100%"
        max-height="600">
        <el-table-column
          prop="title"
          label="名称"
          width="180">
        </el-table-column>

         <el-table-column
          prop="address"
          label="地址"
          width="360">
        </el-table-column>

         <el-table-column
          prop="tel"
          label="电话"
          width="180">
        </el-table-column>

         <el-table-column
          prop="category"
          label="类别"
          width="180">
        </el-table-column>

        <el-table-column
          prop="lat"
          label="纬度"
          width="180">
        </el-table-column>
      <el-table-column
          prop="lng"
          label="经度"
          width="180">
        </el-table-column>
       <el-table-column
          prop="adcode"
          label="行政区划代码"
          width="180">
        </el-table-column>
       <el-table-column
          prop="province"
          label="省"
          width="180">
        </el-table-column>
      <el-table-column
          prop="city"
          label="市"
          width="180">
        </el-table-column>
     <el-table-column
          prop="district"
          label="区"
          width="180">
        </el-table-column>
  </el-table>
    </el-card>
    

  </div>
</template>

<script>

import $ from 'jquery';
const { ipcRenderer,remote } =  window.require('electron');
let firstUrl = "https://apis.map.qq.com/ws/district/v1/list";
let secondUrl = "https://apis.map.qq.com/ws/district/v1/getchildren";
let url = "https://apis.map.qq.com/ws/place/v1/search";
let key= '';
let loading = null;
const sleep = (timeountMS) => new Promise((resolve) => {
  setTimeout(resolve, timeountMS);
});
 console.log = ()=>{}
export default {
  name: 'Home',
  data() {
    return {
      logoUrl:require("@/assets/logo_white.png"),
      list:[
        // {
        //         "title": 'title', 
        //         "address":"address", 
        //         "tel": "tel", 
        //         "category":"category", 
        //         "lat": "lat",
        //         "lng": "lng", 
        //         "adcode":"adcode",
        //         "province": "province", 
        //         "city": "city", 
        //         "district": "district",
        //       },{
        //         "title": 'title222', 
        //         "address":"address222", 
        //         "tel": "tel222", 
        //         "category":"category222", 
        //         "lat": "lat222",
        //         "lng": "lng222", 
        //         "adcode":"adcode222",
        //         "province": "province222", 
        //         "city": "city222", 
        //         "district": "district222",
        //       }
              ],
      sort:[],
      all:[],
      key:'',
      region:"",
      keyword:'',
      setFormVisible:false,
      intervalId:null,
       props: {
         checkStrictly:true,
          lazy: true,
          lazyLoad (node, resolve) {
            const { level } = node;
            let nodes = [];
            if(level == 0){
              let item = {
                value :'全国',
                 label:'全国',
                id :0,
                leaf :false,
              }
              nodes.push(item)
              resolve(nodes)
            }else if(level == 1){
             
                  $.ajax({
                    url:firstUrl,
                    dataType:'jsonp',
                    data:{
                      key:key,
                      output:'jsonp'
                    },
                    success:function(res){
                        if(res.status == 0){
                          let li = res.result[0];
                          console.log(li)
                          for(let i in li){
                            let item = {
                                  value :li[i].fullname,
                                  id :li[i].id,
                                  label:li[i].fullname,
                                  leaf :false,
                                }
                                nodes.push(item)
                          }
                      resolve(nodes)
                      }else{
                        alert(res.message)
                      }
                    }
                  })
              }else if(level == 2){

             $.ajax({
                    url:secondUrl,
                    dataType:'jsonp',
                    data:{
                      key:key,
                      id:node.data.id,
                      output:'jsonp'
                    },
                    success:function(res){
                        if(res.status == 0){
                          let li = res.result[0];
                          console.log(li)
                          for(let i in li){
                            let item = {
                                  value :li[i].fullname,
                                  label:li[i].fullname,
                                  id :li[i].id,
                                  leaf :'leaf',
                                }
                                nodes.push(item)
                          }
                      resolve(nodes)
                      }else{
                        alert(res.message)
                      }
                    }
                  })


              }
               
          }
        }
    }
  },
  methods:{
    refreshPage(){
      location.reload();
    },
    saveWithExcel(){
      if(this.list.length == 0){
         this.$message({
                    message: '没有可以保存的数据',
                    type: 'error'
                  });
        return;
      }
      ipcRenderer.send('save',this.list)
    },
    onChange(value){
      
        this.region = value[value.length - 1];
    },
    onSubmit(){
      
        console.log(this.region,this.keyword)
        console.log(this.key)
       
         if(!key || key.length<=0){
                  this.$message({
                    message: '请先设置APIKey',
                    type: 'warning'
                  });
           return;
         }
         
         

            let keyword = this.keyword.trim();
             let name = this.region.trim();

               
         if(name.length == 0){
            this.$message({
                    message: '请先选择搜索范围',
                    type: 'error'
                  });
           return;
         }
           if(keyword.length == 0){
            this.$message({
                    message: '请先输入搜索关键字',
                    type: 'error'
                  });
           return;
         }


          if(this.intervalId){
              clearInterval(this.intervalId);
          }
           
                if(loading){
                      loading.close(); //关闭加载遮罩层
                }
               loading = this.$loading({
                lock: true,
                text: '拼命搜索中,请稍后...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.8)',
                target: document.querySelector('#table')
              });
             

           this.sort = [];
           this.all = [];
           this.list = [];

            let that = this;
            that.searchByName(keyword,name,1);
            let count = 0;
            this.intervalId = setInterval(function(){
                let elem = that.sort.shift();
                if(elem){
                  that.searchByName(keyword,elem.city,elem.page);
                }else{
                  count++;
                }
                if(count >= 8){
                  if(that.intervalId){
                    clearInterval(that.intervalId);
                  }
                  if(loading){
                      loading.close(); //关闭加载遮罩层
                  }
                  
                   that.$message({
                    message: '搜索完成',
                    type: 'success'
                  });
                }
            },1000) 
    },

    onSetSubmit(){
      if(!this.key || this.key.trim().length == 0){
        this.$message({
                    message: 'Key不能为空',
                    type: 'error'
                  });
           return;
      }
      key = this.key.trim();
      localStorage.setItem("KEY", this.key.trim());
      this.setFormVisible = false;
      location.reload();
    },

/*
{ "title": "酒仙网国际名酒城(数字工场店)", 
"address": "北京市通州区经海五路58号数字工厂8号楼1层", 
"tel": "333333333", 
"category": "购物:烟酒专卖", 
"location": { "lat": 39.790161, "lng": 116.565228 }, 
"ad_info": { 
    "adcode": 110112, 
    "province": "北京市", 
    "city": "北京市", 
    "district": "通州区" }
 }
*/

    apiQuery(keyword,region,page,callback){
      console.log(keyword,region,page)
        $.ajax({
          url:url,
          dataType:'jsonp',
          data:{
            keyword:keyword,
            boundary:'region('+region+',0)',
            key:key,
            output:'jsonp',
            page_size:20,
            page_index:page,
          },
          success:callback
        })
    },

    searchByName(keyword,name,page){
      let that = this;
      this.apiQuery(keyword,name,page,async function(res){

         if(res.status == 0){
           if(res.cluster && res.cluster.length > 0){
             console.log(res.cluster)
           

            for(let i in res.cluster){
              let cname = res.cluster[i].title;
              console.log(cname)
              

              if(name != cname && cname.indexOf(name) != 0){

                
                if(that.all.indexOf(cname) < 0){
                  that.sort.push({city:cname,page:1});
                  that.all.push(cname)
                }
               
                //that.searchByName(keyword,cname,1)
              }
              
              await sleep(1500)
            }

           }else{

            for(let i in res.data){


              let d = res.data[i];

              let elem = {
                "title": d.title, 
                "address": d.address, 
                "tel": d.tel, 
                "category":d.category, 
                "lat": d.location.lat,
                "lng": d.location.lng, 
                "adcode":d.ad_info.adcode,
                "province": d.ad_info.province, 
                "city": d.ad_info.city, 
                "district": d.ad_info.district,
              }
              that.list.push(elem);
            }

             let count = res.count;
             if(count > 200){
               count = 200;
             }
              let pages = parseInt((count + 20 - 1) / 20);
              if(page < pages){
                console.log(res)
                console.log('--------------------' + name)
                that.sort.push({city:name,page:++page});
              }
            
           }
                
                 /*120	此key每秒请求量已达到上限
                  121	此key每日调用量已达到上限*/
            }else if(res.status == 120){
              that.sort.push({city:name,page:page});
               console.log(res.message)
            }else if(res.status == 121){
               console.log(res.message)
            }else{
              console.log(res.message)
            }
      });

    }

  },
  mounted(){
    let tempKey = localStorage.getItem("KEY");
    if(tempKey){
        this.key = tempKey;
        key = tempKey;
    }else{
       this.$message({
          message: '请先设置APIKey',
          type: 'warning'
        });
      this.setFormVisible = true;
    }
      
  },
  created(){

  }
};
</script>


<style>
.info > .el-card__body{
  min-height:24px;
}

</style>