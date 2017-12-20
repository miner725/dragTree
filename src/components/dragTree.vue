<template>
    <div class="tree">
      <div class="edit-tree-content">
        <el-button type="primary" @click="addTopNode()"> 新增 </el-button>
        <el-tree
          :data="data2"
          :props="defaultProps"
          node-key="id"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          :render-content="renderContent"
          @node-click="handleNodeClick"
          unselectable="on"
          onselectstart="return false;"
          style="-moz-user-select:none;"
          id="elTree" >
          <!--
            props  配置树的结构
            show-checkbox   显示选中框
            node-key  唯一树节点标识 (是否可以根据这个排序！！！)
            highlight-current   高亮当前选中值 默认false
            default-expand-all   默认展开所有节点
            expand-on-click-node  点击节点的时候展开或者收缩节点，false点击箭头收缩展开
            render-content   树节点的内容区渲染
            unselectable，onselectstart  阻止移动的时候选中文字
          -->
        </el-tree>
      </div>
      <el-dialog title="新增父级节点" :visible.sync="addParentDialogVisible" :before-close="closeParentDialog" size="small">
        <el-form :model="newParentNode" :rules="rules" ref="newParentNode">
          <el-form-item label="节点名" prop="name" label-width="70px">
            <el-input v-model="newParentNode.name" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addParentNode()" size="small">确定</el-button>
          <el-button @click="closeParentDialog()" size="small">取消</el-button>
        </div>
      </el-dialog>

      <el-dialog title="新增子级节点" :visible.sync="addDialogVisible" :before-close="closeAddDialog">
        <el-form :model="newNodeObject" :rules="rules" ref="newNodeObject">
          <el-form-item label="节点名" prop="name" label-width="70px">
            <el-input v-model="newNodeObject.name" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addNode(newNodeObject)" size="small">确定</el-button>
          <el-button @click="closeAddDialog" size="small">取消</el-button>
        </div>
      </el-dialog>

      <el-dialog title="删除节点" :visible.sync="delDialogVisible" size="tiny" :before-close="closeDelDialog">
        <span>是否删除节点</span>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="delNode()" size="small">确定</el-button>
          <el-button @click="closeDelDialog" size="small">取消</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
  let id = 1000;

  export default {
    data() {
      return {
        newNodeObject: {
          data: null
        },           //待添加子级节点对象
        newParentNode:{},             //待添加一级对象
        addParentDialogVisible: false,  //添加一级节点对话框初始不显示
        addDialogVisible: false,    //添加节点对话框显示
        delNodeObject: {            //待删除节点对象
          node: null,
        },
        delDialogVisible: false,    //删除节点对话框显示
        rules: {                    //表单校验规则
          name: [
            { required: true, message: '请输入节点名', trigger: 'blur' }
          ]
        },
        filterText: '',             //过滤值
        data2: [
          {id: 1, label: '一级 1',parentId:null,
            children:[
              {parentId:1,label: '二级 1 1',children:[]},
              {parentId:1,label: '二级 1 2',children:[]}
            ]},
          {id: 2, label: '一级 2',parentId:null,
            children:[
              {parentId:2,label: '二级 2 1',children:[]},
              {parentId:2,label: '二级 2 2',children:[]}
            ]},
          {id: 3, label: '一级 3',parentId:null,children:[]},
          {id: 4, label: '一级 4',parentId:null,children:[]},
          {id: 5, label: '一级 5',parentId:null,children:[]}
        ],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        isLeaf: false,
        idx: '',               // 一级分类选中行 索引  用于 添加
        idx2: 0,              // 一级分类选中移动行索引
        endIdx: 0,            // 移动结束位置索引
        lastId: 5,            // 最后一个Id值
        moveNodeObject:{},     // 移动的节点对象
        lock: false,
        currentId: '',
        currentParent: '',
        currentChildren:''
      }
    },
    methods: {
      /* 树结点内渲染函数*/
      renderContent(h, { node, data, store }) {
        return (
          <span class="elTreeLine" onMousedown={() => this.mousedown(data, node)} onMousemove={() => this.mousemove(data,node)} onMouseup={() => this.mouseup(data, node)}>
      <span>
        <span id={node.id}>{node.label}</span>
        </span>
        <span class="btn-box">
          <el-button class="add" size="mini" onClick={() => this.append(store, data)}>+</el-button>
        <el-button class="reduce" size="mini" onClick={() => this.remove(node)}>-</el-button>
        </span>
        </span>);
      },
      /*选中行触发*/
      handleNodeClick(data,node,s){
        this.isLeaf = node.level == 1 ? false : true;   //判断是否选中的是一级分类
        this.idx = this.data2.findIndex(d => d.id === data.id);
      },
      /* 添加框 ---- 一级 */
      addTopNode(){
        this.addParentDialogVisible = true;
      },
      /*添加顶级节点 -- 弹出框确定按钮触发*/
      addParentNode(){
        let newObject = {
          id: ++this.lastId,
          label: this.newParentNode.name,
          parentId: null,
          children: []
        };
        if(this.idx != "" && !this.isLeaf){
          this.data2.splice(this.idx+1,0,newObject)
        }else{
          this.data2.push(newObject);
        }
        this.newParentNode = {};
        this.addParentDialogVisible = false;
      },
      /* 关闭添加对话框 */
      closeParentDialog(){
        this.newParentNode = {};
        this.addParentDialogVisible = false;
      },
      /* 添加节点事件 */
      append(store, data) {
        this.newNodeObject.data = data;
        this.addDialogVisible = true;
      },
      /* 添加节点 */
      addNode(newNodeObjectData) {
        let newChildrenObject = {
          parentId:newNodeObjectData.data.id,
          label: this.newNodeObject.name,
          children:[]
        };
        newNodeObjectData.data.children.push(newChildrenObject);
        this.addDialogVisible = false;
        this.newNodeObject = {data:null};
      },
      /* 关闭添加节点对话框 */
      closeAddDialog() {
        this.addDialogVisible = false;
        this.newNodeObject = {data:null};
      },
      /* 移除节点事件 */
      remove(node) {
        this.delNodeObject.node = node;
        this.delDialogVisible = true;
      },
      /* 删除节点 */
      delNode() {
        const parent = this.delNodeObject.node.parent;
        const children = parent.data.children || parent.data;   //有没有子级
        const index = parent.childNodes.findIndex(d => d.id === this.delNodeObject.node.id);
        children.splice(index,1);
        this.delDialogVisible = false;
        this.delNodeObject.node = null;
      },
      /* 关闭删除对话框 */
      closeDelDialog() {
        this.delDialogVisible = false;
        this.delNodeObject.node = null;
      },
      mousedown(data,node){
        this.currentId = node.id;

        this.currentParent = node.parent;
        this.currentChildren = this.currentParent.data.children || this.currentParent.data;

        this.idx2 = this.currentParent.childNodes.findIndex(d => d.id === node.id);//当前选中的 索引
        this.moveNodeObject = this.currentChildren[this.idx2];     //当前选中移动 数据

        let treeNodeContent = document.getElementsByClassName("el-tree-node__content");
        for(let i=0;i<treeNodeContent.length;i++){
          treeNodeContent[i].style.cursor = "move";
        }
        this.lock = true;
      },
      mousemove(data,node){
        if(this.lock && node.id != this.currentId){
          const parent = node.parent;
          const children = parent.data.children || parent.data;
          this.endIdx = parent.childNodes.findIndex(d => d.id === node.id);
        }
      },
      mouseup(data,node){
        if(node.id != this.currentId){
          this.currentChildren.splice(this.idx2,1);
          this.currentChildren.splice(this.endIdx,0,this.moveNodeObject);
          //为了让子级节点移动有效果
          this.data2.push({});
          this.data2.pop();
        }
        this.lock = false;
        this.currentParent = "";
        this.currentChildren = "";
        let treeNodeContent = document.getElementsByClassName("el-tree-node__content");
        for(let i=0;i<treeNodeContent.length;i++){
          treeNodeContent[i].style.cursor = "pointer";
        }
      }
    }
  };
</script>

<style lang="scss">
  .tree {
    width: 500px;
    text-align: left;
    margin-left: 100px;
    .edit-tree-content {
      .btn-box {
        float: right;
        margin-right: 20px;

        .add,
        .reduce {
          width: 22px;
        }
      }
    }

    .search-tree-content {}
    .elTreeLine{
      display: inline-block;
      width: 94.5%;
      height:auto;
    }
  }
  .el-tree-node__content{
    height: 34px;
  }
</style>
