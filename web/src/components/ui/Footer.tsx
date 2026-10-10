/**
 * Footer component — 1:1 replica of VPCS official website footer (vpcs.fanyu.com).
 * Spec extracted from rendered page: bg #F7F9FF, logo 201x40, QR 84x84,
 * labels 16px/500 #1D2129 (64px wide), items 14px #4E5969, gaps 40px/24px,
 * divider #D6DAE5, complaint email 16px/500 #E44548 centered, bottom row
 * space-between 14px #4E5969.
 *
 * `simple` variant (登录页): 去掉在线客服、快捷入口、投诉与举报区块，
 * 仅保留 logo、微信公众号二维码与底部备案信息行。
 */
export default function Footer({ simple = false }: { simple?: boolean }) {
  return (
    <footer className="bg-[#f7f9ff]">
      <div className="max-w-[1400px] mx-auto px-12 pt-[60px] pb-[40px]">
        {/* ═══ Top: logo | contact/links | QR ═══ */}
        <div className="flex items-center justify-between flex-wrap gap-y-8 gap-x-12">
          <img src="/footer-logo.png" alt="维普论文检测 VPCS" className="w-[201px] h-auto shrink-0" />

          {!simple && (
            <div className="shrink-0">
              {/* Row 1: 在线客服 */}
              <div className="flex items-center flex-wrap gap-x-10 gap-y-2 mb-6">
                <span className="w-16 shrink-0 text-[16px] font-medium text-[#1d2129] leading-[24px]">在线客服</span>
                <span className="text-[14px] text-[#4e5969] leading-[22px]">电话：400-607-5550</span>
                <span className="text-[14px] text-[#4e5969] leading-[22px]">QQ：4006075550</span>
                <span className="text-[14px] text-[#4e5969] leading-[22px]">邮箱：vpcs@fanyu.com</span>
              </div>
              {/* Row 2: 快捷入口 */}
              <div className="flex items-center flex-wrap gap-x-10 gap-y-2">
                <span className="w-16 shrink-0 text-[16px] font-medium text-[#1d2129] leading-[24px]">快捷入口</span>
                <span className="text-[14px] text-[#4e5969] leading-[22px] cursor-pointer hover:text-[#1d2129] transition-colors">帮助中心</span>
                <span className="text-[14px] text-[#4e5969] leading-[22px] cursor-pointer hover:text-[#1d2129] transition-colors">公司官网</span>
                <span className="text-[14px] text-[#4e5969] leading-[22px] cursor-pointer hover:text-[#1d2129] transition-colors">系统简介</span>
                <span className="text-[14px] text-[#4e5969] leading-[22px] cursor-pointer hover:text-[#1d2129] transition-colors">联系我们</span>
                <span className="text-[14px] text-[#4e5969] leading-[22px] cursor-pointer hover:text-[#1d2129] transition-colors">算法公示</span>
              </div>
            </div>
          )}

          {/* 微信公众号 */}
          <div className="w-[84px] shrink-0 text-center">
            <img src="/footer-wechat-qr.png" alt="微信公众号" className="w-[84px] h-[84px] block" />
            <p className="text-[12px] text-[#4e5969] leading-[17px] mt-4">微信公众号</p>
          </div>
        </div>

        {/* ═══ Divider ═══ */}
        <div className="h-px bg-[#d6dae5] mt-12 mb-5" />

        {/* ═══ Bottom: complaint email + legal row ═══ */}
        {!simple && (
          <div className="text-center mb-3">
            <span className="text-[16px] font-medium text-[#e44548] leading-[24px]">投诉与举报邮箱：vpcs@fanyu.com</span>
          </div>
        )}
        <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-1 text-[14px] text-[#4e5969] leading-[22px]">
          <span>重庆维普资讯有限公司</span>
          <span className="cursor-pointer">渝ICP备16011291号-1</span>
          <span className="cursor-pointer">渝公网安备50019002503141号</span>
          <span className="cursor-pointer">违法和不良信息举报中心：https://www.12377.cn</span>
          <span>泛语科技【荣誉出品】版权所有 1998-2026</span>
        </div>
      </div>
    </footer>
  )
}
