
import React from 'react';
import { MenuItem, QuickAction, Store, StoreRegion } from './types.ts';
import { 
  Megaphone, 
  Settings,
  Users,
  Archive,
  Package,
  RefreshCw,
  Activity,
  Plug,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  LayoutGrid,
  Database,
  MessageCircle,
  UserCheck,
  Facebook,
  FileText,
  Search,
  Share2,
  ShoppingBag,
  Image as ImageIcon,
  Banknote,
  ClipboardList,
  ArrowRightFromLine,
  Mail,
  SquarePen,
  Headset,
  Percent,
  Wrench,
  Badge,
  Monitor,
  Presentation,
  FileCog,
  Gift,
  Puzzle,
  Store as StoreIcon, // Alias to avoid conflict with Store interface
  Stamp
} from 'lucide-react';

// Marketplace Mapping based on API Docs
export const MARKETPLACE_MAP: Record<string, string> = {
    'US': '美国', 'CA': '加拿大', 'MX': '墨西哥', 'BR': '巴西',
    'GB': '英国', 'DE': '德国', 'FR': '法国', 'IT': '意大利', 'ES': '西班牙', 'NL': '荷兰', 'SE': '瑞典', 'PL': '波兰', 'TR': '土耳其',
    'JP': '日本', 'AU': '澳大利亚', 'IN': '印度', 'AE': '阿联酋', 'SA': '沙特', 'SG': '新加坡',
    'IE': '爱尔兰', 'BE': '比利时'
};

// Full 3-Level Menu Structure based on requirements
export const MAIN_MENU: MenuItem[] = [
  {
    id: 'product',
    label: '商品',
    children: [
      {
        id: 'prod_mgmt',
        label: '商品管理',
        icon: <Package size={16} />,
        children: [
          { id: 'prod_list', label: '商品列表' },
          { id: 'multiAttributeList', label: '多属性列表' },
          { id: 'prod_acc', label: '辅料管理' },
          { id: 'prod_cat', label: '商品分类' },
        ]
      },
      {
        id: 'prod_new',
        label: '新品',
        icon: <ShoppingBag size={16} />,
        children: [
          { id: 'prod_dev', label: '新品开发' },
        ]
      },
      {
        id: 'prod_img',
        label: '图片',
        icon: <ImageIcon size={16} />,
        children: [
          { id: 'img_mgmt', label: '图片管理' },
        ]
      }
    ]
  },
  {
    id: 'sales',
    label: '销售',
    children: [
       {
        id: 'sales_prod',
        label: '产品管理',
        icon: <LayoutGrid size={16} />,
        children: [
          { id: 'online_prod', label: '在线产品' },
          { id: 'prod_listing', label: '产品刊登' },
          { id: 'aplus_mgmt', label: 'A+管理', isNew: true },
          { id: 'infringe_check', label: '侵权检测', isHot: true },
          { id: 'tag_mgmt', label: '标签管理' },
          { id: 'trans_mgmt', label: '透明计划管理' },
          { id: 'inv_sync', label: '产品库存同步' },
        ]
      },
      {
        id: 'sales_promo',
        label: '促销管理',
        icon: <Banknote size={16} />,
        children: [
          { id: 'promo_act', label: '促销活动' },
          { id: 'disc_mon', label: '折扣监控' },
          { id: 'flash_inv', label: '秒杀调库存' },
        ]
      },
      {
        id: 'sales_ops',
        label: '运营管理',
        icon: <Share2 size={16} />,
        children: [
          { id: 'ops_plan', label: '运营计划' },
          { id: 'ops_todo', label: '运营待办' },
          { id: 'ops_review', label: '运营复盘', isNew: true },
        ]
      }
    ]
  },
  {
    id: 'order',
    label: '订单',
    children: [
      {
        id: 'order_mgmt',
        label: '订单管理',
        icon: <ClipboardList size={16} />,
        children: [
          { id: 'platformOrder', label: '全部订单' },
          { id: 'order_proc', label: '订单处理' },
        ]
      },
      {
        id: 'order_rules',
        label: '订单规则',
        icon: <ArrowRightFromLine size={16} />,
        children: [
          { id: 'audit_rule', label: '审单规则' },
          { id: 'gift_rule', label: '赠品规则' },
          { id: 'merge_rule', label: '合单规则' },
          { id: 'split_rule', label: '拆单规则' },
          { id: 'log_rule', label: '物流规则' },
          { id: 'addr_conf', label: '地址配置' },
          { id: 'mark_rule', label: '标发规则' },
        ]
      },
      {
        id: 'order_other',
        label: '其他功能',
        icon: <LayoutGrid size={16} />,
        children: [
          { id: 'submit_plat', label: '提交平台' },
          { id: 'log_group', label: '物流组包' },
          { id: 'log_track', label: '物流追踪' },
          { id: 'log_check', label: '物流对账' },
          { id: 'pur_sugg', label: '采购建议' },
        ]
      },
      {
        id: 'order_amz',
        label: '亚马逊订单',
        icon: <FileText size={16} />,
        children: [
          { id: 'ex_order', label: '换货订单' },
          { id: 'ret_order', label: '退货订单' },
          { id: 'rm_order', label: '移除订单' },
          { id: 'mc_order', label: '多渠道订单' },
          { id: 'test_order', label: '测评订单' },
        ]
      }
    ]
  },
  {
    id: 'service',
    label: '客服',
    children: [
      {
        id: 'svc_mail',
        label: '邮件沟通',
        icon: <Mail size={16} />,
        children: [
          { id: 'mail_msg', label: '邮件消息' },
          { id: 'mail_tool', label: '邮件工具' },
        ]
      },
      {
        id: 'svc_mkt',
        label: '营销邮件',
        icon: <Megaphone size={16} />,
        children: [
          { id: 'mail_rule', label: '邮件规则' },
          { id: 'send_rec', label: '发送记录' },
          { id: 'eff_track', label: '效果追踪' },
          { id: 'blk_list', label: '拒收名单' },
        ]
      },
      {
        id: 'svc_review',
        label: '评价管理',
        icon: <SquarePen size={16} />,
        children: [
          { id: 'review_list', label: 'Review' },
          { id: 'review_ana', label: 'Review分析' },
          { id: 'feedback', label: 'Feedback' },
          { id: 'req_rule', label: '请求规则' },
          { id: 'req_rec', label: '请求记录' },
        ]
      },
      {
        id: 'svc_perf',
        label: '绩效管理',
        icon: <Activity size={16} />,
        children: [
          { id: 'shop_perf', label: '店铺绩效' },
        ]
      },
      {
        id: 'svc_vat',
        label: 'VAT管理',
        icon: <Percent size={16} />,
        children: [
          { id: 'vat_inv', label: 'VAT发票' },
        ]
      },
      {
        id: 'svc_after',
        label: '售后管理',
        icon: <Headset size={16} />,
        children: [
          { id: 'after_ana', label: '售后分析', isNew: true },
          { id: 'ret_ana', label: '退货分析' },
          { id: 'rep_ana', label: '复购分析' },
        ]
      }
    ]
  },
  {
    id: 'ads',
    label: '广告',
    children: [
      {
        id: 'ads_eff',
        label: '提效管理',
        icon: <BarChart3 size={16} />,
        children: [
          { id: 'ads_pano', label: '广告全景仪' },
          { id: 'ads_mgmt', label: '广告管理' },
          { id: 'batch_create', label: '批量创建' },
          { id: 'global_view', label: '全局概览' },
          { id: 'traffic_insight', label: '引流洞察' },
        ]
      },
      {
        id: 'ads_prod',
        label: '产品分析',
        icon: <Monitor size={16} />,
        children: [
          { id: 'prod_pers', label: '产品透视' },
          { id: 'data_agg', label: '数据聚合' },
          { id: 'purchased_ana', label: '已购分析' },
        ]
      },
      {
        id: 'ads_traffic',
        label: '流量分析',
        icon: <Activity size={16} />,
        children: [
          { id: 'budget_ana', label: '预算分析' },
          { id: 'aba_term', label: 'ABA搜索词' },
          { id: 'rep_ad', label: '重复投放' },
          { id: 'order_term', label: '出单搜索词' },
          { id: 'freq_ana', label: '词频分析' },
          { id: 'creator_plan', label: '创作者计划', isNew: true },
        ]
      },
      {
        id: 'ads_tool',
        label: '智能工具',
        icon: <Wrench size={16} />,
        children: [
          { id: 'time_stg', label: '分时策略' },
          { id: 'auto_rule', label: '自动化规则' },
          { id: 'rank_grab', label: '抢排名' },
        ]
      },
      {
        id: 'ads_asset',
        label: '广告资产',
        icon: <Badge size={16} />,
        children: [
          { id: 'kw_lib', label: '关键词库' },
          { id: 'tag_sys', label: '标签系统' },
          { id: 'rep_dl', label: '报告下载' },
          { id: 'amc_term', label: 'AMC搜索词' },
          { id: 'amc_aud', label: 'AMC人群包', isNew: true },
          { id: 'amc_path', label: 'AMC买家路径', isNew: true },
        ]
      }
    ]
  },
  {
    id: 'fba',
    label: 'FBA',
    children: [
      {
        id: 'fba_plan',
        label: '计划管理',
        icon: <BarChart3 size={16} />,
        children: [
          { id: 'restock_sugg', label: '补货建议' },
          { id: 'ship_plan', label: '发货计划' },
        ]
      },
      {
        id: 'fba_ship',
        label: '货件管理',
        icon: <Package size={16} />,
        children: [
          { id: 'fba_ship_list', label: 'FBA货件' },
          { id: 'ship_dash', label: '货件看板' },
          { id: 'ship_order', label: '发货单' },
          { id: 'first_mile', label: '头程分摊' },
        ]
      }
    ]
  },
  {
    id: 'purchase',
    label: '采购',
    children: [
      {
        id: 'pur_mgmt',
        label: '采购管理',
        icon: <Package size={16} />,
        children: [
          { id: 'pur_plan', label: '采购计划' },
          { id: 'pur_order', label: '采购单' },
          { id: 'pur_change', label: '采购变更单' },
          { id: 'pur_in', label: '采购入库单' },
          { id: 'pur_ret', label: '采购退货单' },
        ]
      },
      {
        id: 'pur_1688',
        label: '1688',
        icon: <Plug size={16} />,
        children: [
          { id: '1688_order', label: '1688订单' },
          { id: '1688_pair', label: '1688配对' },
        ]
      },
      {
        id: 'pur_sup',
        label: '供应商',
        icon: <Users size={16} />,
        children: [
          { id: 'sup_list', label: '供应商列表' },
          { id: 'sup_check', label: '供应商对账' },
          { id: 'buyer_list', label: '采购方列表' },
        ]
      }
    ]
  },
  {
    id: 'warehouse',
    label: '仓库',
    children: [
      {
        id: 'wh_inv',
        label: '库存',
        icon: <Archive size={16} />,
        children: [
          { id: 'wh_list', label: '仓库列表' },
          { id: 'inv_detail', label: '库存明细' },
          { id: 'inv_flow', label: '库存流水' },
          { id: 'fba_inv', label: 'FBA库存' },
          { id: 'inv_age', label: '库龄报表' },
          { id: 'all_inv', label: '全仓库存' },
        ]
      },
      {
        id: 'wh_send',
        label: '发货管理',
        icon: <Package size={16} />,
        children: [
          { id: 'wave_mgmt', label: '波次管理' },
          { id: 'sec_pick', label: '二次分拣' },
          { id: 'scan_chk', label: '扫描验货' },
          { id: 'weight_send', label: '称重发货' },
        ]
      },
      {
        id: 'wh_rec',
        label: '收货管理',
        icon: <Package size={16} />,
        children: [
          { id: 'wait_arr', label: '待到货' },
          { id: 'arr_rec', label: '到货记录' },
          { id: 'qc_order', label: '质检单' },
          { id: 'in_ex_order', label: '入库异常单' },
        ]
      },
      {
        id: 'wh_overseas',
        label: '海外仓',
        icon: <Archive size={16} />,
        children: [
          { id: 'ovs_prep', label: '海外仓备货单' },
          { id: 'ovs_batch', label: '海外仓批次' },
          { id: '3rd_inv', label: '三方仓库存' },
        ]
      },
      {
        id: 'wh_cost',
        label: '成本补录',
        icon: <Settings size={16} />,
        children: [
          { id: 'cost_add', label: '成本补录单' },
        ]
      },
      {
        id: 'wh_io',
        label: '出入库',
        icon: <RefreshCw size={16} />,
        children: [
          { id: 'other_in', label: '其他入库' },
          { id: 'other_out', label: '其他出库' },
          { id: 'adj_order', label: '调整单' },
          { id: 'proc_order', label: '加工单' },
          { id: 'trans_order', label: '调拨单' },
          { id: 'cnt_order', label: '盘点单' },
        ]
      },
      {
        id: 'wh_box',
        label: '装箱管理',
        icon: <Package size={16} />,
        children: [
          { id: 'box_mgmt', label: '装箱管理' },
          { id: 'scan_tag', label: '扫码打标' },
          { id: 'scan_box', label: '扫描装箱' },
        ]
      }
    ]
  },
  {
    id: 'logistics',
    label: '物流',
    children: [
      {
        id: 'log_head',
        label: '头程物流',
        icon: <Package size={16} />,
        children: [
          { id: 'log_prov', label: '物流商列表' },
          { id: 'head_log', label: '头程物流' },
          { id: 'prov_chk', label: '物流商对账' },
          { id: 'head_track', label: '头程追踪' },
        ]
      },
      {
        id: 'log_self',
        label: '自发货物流',
        icon: <Package size={16} />,
        children: [
          { id: 'log_mgmt', label: '物流管理' },
          { id: 'fee_tpl', label: '运费模版' },
          { id: 'addr_mgmt', label: '地址管理' },
        ]
      },
      {
        id: 'log_customs',
        label: '报关管理',
        icon: <Settings size={16} />,
        children: [
          { id: 'cus_data', label: '报关资料' },
          { id: 'cus_tpl', label: '报关模版' },
        ]
      },
      {
        id: 'log_smart',
        label: '智慧物流',
        icon: <Zap size={16} />,
        children: [
          { id: 'pool_stg', label: '拼货策略' },
        ]
      }
    ]
  },
  {
    id: 'data',
    label: '数据',
    children: [
      {
        id: 'data_sales',
        label: '销量分析',
        icon: <LineChart size={16} />,
        children: [
          { id: 'sales_stat', label: '销量统计' },
          { id: 'shop_perf_day', label: '店铺日报', isNew: true },
          { id: 'sea_asst', label: '海卖助手' },
          { id: 'fest_screen', label: '节日大屏' },
        ]
      },
      {
        id: 'data_biz',
        label: '经营概览',
        icon: <PieChart size={16} />,
        children: [
          { id: 'biz_board', label: '经营看板' },
          { id: 'prod_ana_biz', label: '产品分析' },
          { id: 'asin_board', label: 'ASIN看板' },
          { id: 'multi_board', label: '多平台看板' },
        ]
      },
      {
        id: 'data_theme',
        label: '主题分析',
        icon: <Presentation size={16} />,
        children: [
          { id: 'sales_insight', label: '销量洞察' },
          { id: 'sales_profit', label: '销售利润' },
          { id: 'brand_ana', label: '品牌分析', isNew: true },
        ]
      },
      {
        id: 'data_custom',
        label: '自定义报表',
        icon: <FileCog size={16} />,
        children: [
          { id: 'custom_rep', label: '自定义报表' },
          { id: 'theme_rep', label: '主题报表', isHot: true },
        ]
      },
      {
        id: 'data_center',
        label: '报告中心',
        icon: <FileText size={16} />,
        children: [
          { id: 'rep_center', label: '报告中心' },
        ]
      }
    ]
  },
  {
    id: 'finance',
    label: '财务',
    children: [
      {
        id: 'fin_pay',
        label: '请付款',
        icon: <RefreshCw size={16} />,
        children: [
          { id: 'pay_pool', label: '请款池' },
          { id: 'pay_req', label: '请款单' },
          { id: 'pay_order', label: '付款单' },
          { id: 'rec_order', label: '收款单' },
        ]
      },
      {
        id: 'fin_profit',
        label: '利润管理',
        icon: <LineChart size={16} />,
        children: [
          { id: 'profit_rep', label: '利润报表' },
          { id: 'perf_rep', label: '业绩报表' },
          { id: 'fin_check', label: '财务对账' },
        ]
      },
      {
        id: 'fin_cost',
        label: '成本管理',
        icon: <PieChart size={16} />,
        children: [
          { id: 'batch_cost', label: '批次成本' },
          { id: 'fee_mgmt', label: '费用管理' },
          { id: 'sign_diff', label: '签收差异' },
        ]
      },
      {
        id: 'fin_settle',
        label: '结算管理',
        icon: <Settings size={16} />,
        children: [
          { id: 'settle_ctr', label: '结算中心' },
          { id: 'coll_tool', label: '收款工具' },
          { id: 'ads_inv', label: '广告发票' },
          { id: 'ship_settle', label: '发货与结算' },
        ]
      },
      {
        id: 'fin_fund',
        label: '资金管理',
        icon: <BarChart3 size={16} />,
        children: [
          { id: 'ar_rep', label: '应收报表' },
        ]
      },
      {
        id: 'fin_rep',
        label: '报表管理',
        icon: <Archive size={16} />,
        children: [
          { id: 'inv_rep', label: '库存报表' },
          { id: 'comp_rep', label: '赔偿' },
          { id: 'mon_store', label: '月仓储费' },
          { id: 'long_store', label: '长期仓储费' },
        ]
      }
    ]
  },
  {
    id: 'tools',
    label: '工具',
    children: [
      {
        id: 'tool_ops',
        label: '运营工具',
        icon: <Zap size={16} />,
        children: [
          { id: 'kw_rank', label: '关键词排名' },
          { id: 'comp_mon', label: '竞品监控' },
          { id: 'new_mon', label: '上新监控' },
          { id: 'follow_mon', label: '跟卖监控' },
          { id: 'profit_cal', label: '利润试算' },
          { id: 'ship_diff', label: 'FBA运费差异' },
        ]
      },
      {
        id: 'tool_img',
        label: '图文工具',
        icon: <LayoutGrid size={16} />,
        children: [
          { id: 'list_copy', label: 'Listing文案' },
          { id: 'ai_img', label: 'AI生图' },
        ]
      },
      {
        id: 'tool_warn',
        label: '预警中心',
        icon: <Megaphone size={16} />,
        children: [
          { id: 'warn_rule', label: '预警规则' },
          { id: 'warn_msg', label: '预警消息' },
        ]
      },
      {
        id: 'tool_print',
        label: '打印工具',
        icon: <Package size={16} />,
        children: [
          { id: 'print_tpl', label: '打印模版' },
          { id: 'exp_tpl', label: '导出模版' },
          { id: 'print_tag', label: '打印标签（模版）' },
        ]
      }
    ]
  },
  {
    id: 'settings',
    label: '设置',
    children: [
      {
        id: 'set_acc',
        label: '账号管理',
        icon: <Users size={16} />,
        children: [
          { id: 'sub_acc', label: '子账号' },
          { id: 'role_mgmt', label: '角色管理' },
          { id: 'data_scope', label: '数据范围管理' },
        ]
      },
      {
        id: 'set_sys',
        label: '系统设置',
        icon: <Settings size={16} />,
        children: [
          { id: 'biz_set', label: '业务设置' },
          { id: 'rate_set', label: '汇率设置' },
        ]
      },
      {
        id: 'set_appr',
        label: '审批管理',
        icon: <Stamp size={16} />,
        children: [
          { id: 'appr_wk', label: '审批工作台' },
          { id: 'appr_set', label: '审批设置' },
        ]
      },
      {
        id: 'set_plug',
        label: '插件管理',
        icon: <Puzzle size={16} />,
        children: [
          { id: 'task_ctr', label: '任务中心' },
        ]
      },
      {
        id: 'set_pkg',
        label: '套餐管理',
        icon: <Gift size={16} />,
        children: [
          { id: 'pkg_buy', label: '套餐购买' },
        ]
      },
      {
        id: 'set_shop',
        label: '店铺管理',
        icon: <StoreIcon size={16} />,
        children: [
          { id: 'shop', label: '店铺授权' },
          { id: 'vc_auth', label: 'VC店铺授权' },
          { id: '1688_acc', label: '1688账号管理' },
          { id: 'cust_shop', label: '自定义店铺' },
          { id: 'trans_auth', label: '透明计划授权' },
        ]
      },
      {
        id: 'set_log',
        label: '日志管理',
        icon: <FileText size={16} />,
        children: [
          { id: 'op_log', label: '操作日志' },
        ]
      }
    ]
  },
  {
    id: 'fb_sys',
    label: 'Facebook营销',
    children: [
      {
        id: 'fb_work',
        label: 'FB聊天',
        icon: <MessageCircle size={16} />,
        children: [
          { id: 'fb_chat_sys', label: 'FB聊天' }
        ]
      },
      {
        id: 'fb_set',
        label: 'FB设置',
        icon: <Settings size={16} />,
        children: [
          { id: 'fb_settings', label: 'FB设置' }
        ]
      }
    ]
  }
];

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'auth',
    title: '店铺授权',
    description: '同步数据支持运营分析/广告/财务',
    icon: <Users size={20} className="text-white" />,
    color: 'bg-blue-500'
  },
  {
    id: 'account',
    title: '账号管理',
    description: '权限分配与层级管控',
    icon: <Settings size={20} className="text-white" />,
    color: 'bg-indigo-500'
  },
  {
    id: 'product',
    title: '商品管理',
    description: '商品信息维护与统一管理',
    icon: <Package size={20} className="text-white" />,
    color: 'bg-sky-500'
  },
  {
    id: 'finance',
    title: '配对管理',
    description: '关联本地商品，支撑进销存及利润核算',
    icon: <RefreshCw size={20} className="text-white" />,
    color: 'bg-cyan-500'
  },
  {
    id: 'message',
    title: '买家消息沟通',
    description: '实时处理买家消息，免费翻译，支持发送关怀邮件',
    icon: <Megaphone size={20} className="text-white" />,
    color: 'bg-blue-400'
  },
  {
    id: 'warehouse',
    title: '仓库管理',
    description: '库存数据管理及流水记录分析',
    icon: <Archive size={20} className="text-white" />,
    color: 'bg-indigo-400'
  },
  {
    id: 'plugin',
    title: '插件安装',
    description: '获取财务报告/促销活动等非接口数据',
    icon: <Plug size={20} className="text-white" />,
    color: 'bg-purple-500'
  },
  {
    id: 'mobile',
    title: '微信移动端',
    description: '移动端随时查看店铺数据，处理邮件及广告调整',
    icon: <Activity size={20} className="text-white" />,
    color: 'bg-blue-600'
  }
];

export const MOCK_STORES: Store[] = [
  { id: '1', name: 'US - Tiger Flagship', region: StoreRegion.NA, marketplace: 'US' },
  { id: '2', name: 'DE - Tiger Europe', region: StoreRegion.EU, marketplace: 'DE' },
  { id: '3', name: 'JP - Tiger Tokyo', region: StoreRegion.JP, marketplace: 'JP' },
];
