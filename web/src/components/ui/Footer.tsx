/**
 * Footer component — 上区三栏：左品牌 logo｜中「在线客服」信息块｜右微信公众号二维码；
 * 分隔线下为居中备案信息行。
 */
export default function Footer() {
  return (
    <footer className="bg-brand-soft border-t border-brand-line">
      <div className="max-w-[1400px] mx-auto px-12 pt-10 pb-8">
        {/* ═══ 上区：品牌 | 在线客服 | 公众号二维码 ═══ */}
        <div className="flex items-center flex-wrap gap-y-10 gap-x-12">
          <img src="/footer-logo.png" alt="维普论文检测 VPCS" className="h-11 w-auto shrink-0" />

          <div className="ml-16">
            <p className="text-subtitle font-semibold text-ink leading-[26px] mb-3">在线客服</p>
            <div className="flex items-center flex-wrap gap-x-8 gap-y-2 text-body text-ink-2 leading-[22px]">
              <span className="tnum">电话：400-607-5550</span>
              <span className="tnum">QQ：4006075550</span>
              <span>邮箱：yjs@fanyu.com</span>
            </div>
          </div>

          <div className="ml-auto w-[84px] shrink-0 text-center">
            <img src="/footer-wechat-qr.png" alt="微信公众号" className="w-[84px] h-[84px] block rounded-md" />
            <p className="text-micro text-ink-2 leading-[17px] mt-2">微信公众号</p>
          </div>
        </div>

        {/* ═══ Divider ═══ */}
        <div className="h-px bg-brand-line mt-8 mb-5" />

        {/* ═══ Bottom: 备案信息行（居中） ═══ */}
        <div className="flex items-center justify-center flex-wrap gap-x-7 gap-y-1.5 text-caption text-ink-2 leading-[22px]">
          <span>重庆维普资讯有限公司</span>
          <span className="cursor-pointer hover:text-brand transition-colors">渝ICP备16011291号-1</span>
          <span className="cursor-pointer hover:text-brand transition-colors">渝公网安备50019002503141号</span>
          <span className="cursor-pointer hover:text-brand transition-colors">违法和不良信息举报中心：https://www.12377.cn</span>
          <span>泛语科技【荣誉出品】版权所有 1998-2026</span>
        </div>
      </div>
    </footer>
  )
}