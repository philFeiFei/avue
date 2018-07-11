import * as utils from "../utils/util.js";
import {
    validatenull
} from '../utils/validate.js'
import crudInput from "../crud/src/crud-input";
import crudSelect from "../crud/src/crud-select";
import crudRadio from "../crud/src/crud-radio";
import crudCheckbox from "../crud/src/crud-checkbox";
import crudCascader from "../crud/src/crud-cascader";
import crudDate from "../crud/src/crud-date";
import crudTime from "../crud/src/crud-time";
import crudInputNumber from '../crud/src/crud-input-number';
import crudUeditor from '../crud/src/crud-ueditor';
import crudSwitch from '../crud/src/crud-switch';
export default function() {
    return {
        props: {
            option: {
                type: Object,
                required: true,
                default: () => {}
            },
        },
        components: {
            crudInput,
            crudSelect,
            crudRadio,
            crudCheckbox,
            crudDate,
            crudTime,
            crudCascader,
            crudInputNumber,
            crudUeditor,
            crudSwitch
        },
        watch: {
            value: {
                handler(n, o) {
                    this.formVal();
                },
                deep: true
            },
            option: {
                handler(n, o) {
                    this.init();
                },
                deep: true
            },
            tableForm: {
                handler(n, o) {
                    this.formVal();
                },
                deep: true
            },
            form: {
                handler(n, o) {
                    this.formVal();
                },
                deep: true
            }
        },
        data() {
            return {
                DIC: {},
                dicList: [],
                dicCascaderList: []
            }
        },
        created() {
            this.init();
        },
        methods: {
            init() {
                //初始化工具
                this.initFun();
                //规则初始化
                this.rulesInit();
                //初始化字典
                this.dicInit();
            },
            dicInit() {
                this.option.column.forEach(ele => {
                    if (!validatenull(ele.dicUrl) && ele.cascaderFirst) {
                        this.dicCascaderList.push({
                            dicUrl: ele.dicUrl,
                            dicData: ele.dicData,
                        })
                    } else if (validatenull(ele.dicUrl) && ele.dicData && typeof ele.dicData == 'string') {
                        this.dicList.push(ele.dicData)
                    }
                })
                this.GetDic().then(data => {
                    this.DIC = data;
                    //初始化表单
                    this.formInit();
                })
            },
            vaildData(val, dafult) {
                if (typeof val == "boolean") {
                    return val;
                }
                return !validatenull(val) ? val : dafult;
            },
            GetDicByType(href, type) {
                return new Promise((resolve, reject) => {
                    resolve([{
                        label: "测试1",
                        value: 1
                    }, {
                        label: "测试2",
                        value: 2
                    }])
                    this.$http.get(href.replace('{{key}}', type)).then(function(response) {
                        if (!validatenull(response.data.data)) {
                            resolve(response.data.data);
                        } else if (!validatenull(response.data)) {
                            resolve(response.data);
                        }
                    })
                })
            },
            GetDic() {
                return new Promise((resolve, reject) => {
                    let result = [],
                        dicData = {},
                        locaDic = this.option.dicData,
                        list = this.dicList,
                        cascaderList = this.dicCascaderList;
                    if (validatenull(list) && validatenull(cascaderList)) {
                        return;
                    }
                    list.forEach(ele => {
                        result.push(new Promise((resolve, reject) => {
                            if (validatenull(this.option.dicUrl)) {
                                resolve(locaDic[ele]);
                            } else {
                                //降级处理data层级关系
                                this.$http.get(`${this.option.dicUrl}/${ele}`).then(function(response) {
                                    if (!validatenull(response.data.data)) {
                                        resolve(response.data.data);
                                    } else if (!validatenull(response.data)) {
                                        resolve(response.data);
                                    } else {
                                        resolve([]);
                                    }
                                })
                            }
                        }))
                    })
                    cascaderList.forEach(ele => {
                        result.push(new Promise((resolve, reject) => {
                            this.GetDicByType(ele.dicUrl, ele.dicData).then(function(response) {
                                list.push(ele.dicData);
                                resolve(response);
                            })
                        }))
                    })
                    Promise.all(result).then(data => {
                        list.forEach((ele, index) => {
                            dicData[ele] = data[index];
                        })
                        if (validatenull(this.option.dicUrl)) {
                            dicData = Object.assign({}, dicData, locaDic)
                        }
                        resolve(dicData);
                    })
                });

            },
            initFun() {
                Object.keys(utils).forEach(key => {
                    this[key] = utils[key];
                })
            },
        }
    };
};