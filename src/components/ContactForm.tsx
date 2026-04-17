"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Send,
  CheckCircle2,
  MessageCircle,
  Mail,
  MapPin,
  Loader2,
} from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import SectionHeader from "./SectionHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface FormData {
  parentName: string;
  whatsapp: string;
  email: string;
  childAge: string;
  learningNeeds: string;
  message: string;
}

const initialFormData: FormData = {
  parentName: "",
  whatsapp: "",
  email: "",
  childAge: "",
  learningNeeds: "",
  message: "",
};

export default function ContactForm() {
  const { t, langCode } = useLanguage();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const loc = {
    errors: {
      parentName: langCode === 'en' ? 'Name is required' : langCode === 'zh-CN' ? '姓名必填' : 'Nama wajib diisi',
      whatsapp: langCode === 'en' ? 'WhatsApp number is required' : langCode === 'zh-CN' ? 'WhatsApp号码必填' : 'Nomor WhatsApp wajib diisi',
      emailReq: langCode === 'en' ? 'Email is required' : langCode === 'zh-CN' ? '电子邮件必填' : 'Email wajib diisi',
      emailInv: langCode === 'en' ? 'Invalid email format' : langCode === 'zh-CN' ? '非法的电子邮箱格式' : 'Format email tidak valid',
      childAge: langCode === 'en' ? "Child's age/level is required" : langCode === 'zh-CN' ? '孩子年龄/年级必填' : 'Usia/jenjang anak wajib diisi',
    },
    successTitle: langCode === 'en' ? 'Thank You!' : langCode === 'zh-CN' ? '谢谢！' : 'Terima Kasih!',
    successDesc: langCode === 'en' ? 'Your message has been sent. Our team will contact you shortly via WhatsApp.' : langCode === 'zh-CN' ? '您的留言已发送。我们的团队将很快通过WhatsApp与您联系。' : 'Pesan Anda telah terkirim. Tim kami akan segera menghubungi Anda melalui WhatsApp.',
    sendAgain: langCode === 'en' ? 'Send Another Message' : langCode === 'zh-CN' ? '发送新消息' : 'Kirim Pesan Lagi',
    
    subtitle: langCode === 'en' ? 'Contact Us' : langCode === 'zh-CN' ? '联系我们' : 'Hubungi Kami',
    title: langCode === 'en' ? 'Start a Consultation Now' : langCode === 'zh-CN' ? '立即开始咨询' : 'Mulai Konsultasi Sekarang',
    desc: langCode === 'en' ? 'We are ready to help you find the most suitable learning program for your child. Contact us or fill out the form below.' : langCode === 'zh-CN' ? '我们准备好帮助您找到最适合您孩子的学习辅导。请联系我们或在下方填写表单。' : 'Kami siap membantu Anda menemukan program belajar yang paling sesuai untuk anak. Hubungi kami atau isi formulir di bawah ini.',
    
    chatWhatsapp: langCode === 'en' ? 'WhatsApp Chat' : langCode === 'zh-CN' ? 'WhatsApp聊天' : 'Chat WhatsApp',
    address: langCode === 'en' ? 'Address' : langCode === 'zh-CN' ? '地址' : 'Alamat',
    serviceAreas: langCode === 'en' ? 'Service Areas' : langCode === 'zh-CN' ? '服务区域' : 'Area Layanan',
    trust: langCode === 'en' ? '"We are here to help you find the best learning support for your child. Don\'t hesitate to ask — we are happy to help."' : langCode === 'zh-CN' ? '“我们在这里帮您找到最适合孩子的学习陪伴。不要犹豫，随时提问——我们很乐意提供帮助。”' : '“Kami di sini untuk membantu Anda menemukan pendampingan belajar terbaik untuk anak. Jangan ragu untuk bertanya — kami dengan senang hati akan membantu.”',
    
    fParentName: langCode === 'en' ? "Parent's Name *" : langCode === 'zh-CN' ? '家长姓名 *' : 'Nama Orang Tua *',
    fParentNamePl: langCode === 'en' ? "Full name" : langCode === 'zh-CN' ? '全名' : 'Nama lengkap',
    fWhatsapp: langCode === 'en' ? "WhatsApp Number *" : langCode === 'zh-CN' ? 'WhatsApp号码 *' : 'Nomor WhatsApp *',
    fChildAge: langCode === 'en' ? "Child's Age / Level *" : langCode === 'zh-CN' ? '孩子年龄 / 年级 *' : 'Usia / Jenjang Anak *',
    fChildAgePl: langCode === 'en' ? "e.g. 5 years old / 2nd Grade" : langCode === 'zh-CN' ? '例如 5岁 / 2年级' : 'Contoh: 5 tahun / SD Kelas 2',
    fNeeds: langCode === 'en' ? "Learning Needs" : langCode === 'zh-CN' ? '学习需求' : 'Kebutuhan Belajar',
    fNeedsPl: langCode === 'en' ? "e.g. Reading, Homework help" : langCode === 'zh-CN' ? '例如：阅读、作业辅导' : 'Contoh: Les calistung, bantuan PR, pendampingan ABK',
    fMessage: langCode === 'en' ? "Message" : langCode === 'zh-CN' ? '留言' : 'Pesan',
    fMessagePl: langCode === 'en' ? "Tell us your child's needs..." : langCode === 'zh-CN' ? '告诉我们您孩子的需求...' : 'Ceritakan kebutuhan anak Anda...',
    
    submitSending: langCode === 'en' ? "Sending..." : langCode === 'zh-CN' ? '发送中...' : 'Mengirim...',
    submitSend: langCode === 'en' ? "Send Message" : langCode === 'zh-CN' ? '发送消息' : 'Kirim Pesan',
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.parentName.trim()) newErrors.parentName = loc.errors.parentName;
    if (!formData.whatsapp.trim()) newErrors.whatsapp = loc.errors.whatsapp;
    if (!formData.childAge.trim()) newErrors.childAge = loc.errors.childAge;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData(initialFormData);
  };

  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  if (isSuccess) {
    return (
      <section id="contact" className="py-16 sm:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 bg-gradient-to-br from-sky-50 to-mint-50 rounded-3xl border border-sky-100"
          >
            <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {loc.successTitle}
            </h3>
            <p className="text-slate-500 mb-6">
              {loc.successDesc}
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="px-6 py-3 text-sm font-semibold text-sky-600 bg-white hover:bg-sky-50 border border-sky-200 rounded-[var(--radius-button)] transition-colors"
            >
              {loc.sendAgain}
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  const wtLinkPrefix = langCode === 'en' ? 'Hello' : langCode === 'zh-CN' ? '你好' : 'Halo';
  const wtLinkSuffix = langCode === 'en' ? ', I want to have a consultation.' : langCode === 'zh-CN' ? '，我想咨询。' : ', saya ingin konsultasi.';

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle={loc.subtitle}
          title={loc.title}
          description={loc.desc}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* WhatsApp CTA */}
            <a
              href={getWhatsAppLink(
                `${wtLinkPrefix} ${t.contactInfo.brandName}${wtLinkSuffix}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-[var(--radius-card)] border border-green-200/50 hover:shadow-[var(--shadow-card)] transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-700">{loc.chatWhatsapp}</p>
              </div>
            </a>

            {/* Service Areas */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-sky-50/50 rounded-[var(--radius-card)] border border-slate-100">
              <p className="text-sm font-semibold text-slate-700 mb-3">{loc.serviceAreas}</p>
              <div className="flex flex-wrap gap-2">
                {t.serviceAreas.map((area: any) => (
                  <span
                    key={area.name}
                    className="px-3 py-1.5 text-xs font-medium text-sky-600 bg-sky-100 rounded-full"
                  >
                    {area.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Trust Statement */}
            <p className="text-sm text-slate-400 leading-relaxed italic">
              {loc.trust}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-5 p-6 sm:p-8 bg-gradient-to-br from-sky-50/30 to-white rounded-[var(--radius-card)] border border-slate-100 shadow-[var(--shadow-card)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nama */}
              <div>
                <label htmlFor="parentName" className="block text-sm font-medium text-slate-600 mb-1.5">
                  {loc.fParentName}
                </label>
                <input
                  id="parentName"
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => handleChange("parentName", e.target.value)}
                  className={`w-full px-4 py-3 text-sm rounded-[var(--radius-button)] border ${errors.parentName ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"} focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all text-slate-700`}
                  placeholder={loc.fParentNamePl}
                />
                {errors.parentName && (
                  <p className="text-xs text-red-500 mt-1">{errors.parentName}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-600 mb-1.5">
                  {loc.fWhatsapp}
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  className={`w-full px-4 py-3 text-sm rounded-[var(--radius-button)] border ${errors.whatsapp ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"} focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all text-slate-700`}
                  placeholder="08xxxxxxxxxx"
                />
                {errors.whatsapp && (
                  <p className="text-xs text-red-500 mt-1">{errors.whatsapp}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Usia Anak */}
              <div>
                <label htmlFor="childAge" className="block text-sm font-medium text-slate-600 mb-1.5">
                  {loc.fChildAge}
                </label>
                <input
                  id="childAge"
                  type="text"
                  value={formData.childAge}
                  onChange={(e) => handleChange("childAge", e.target.value)}
                  className={`w-full px-4 py-3 text-sm rounded-[var(--radius-button)] border ${errors.childAge ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"} focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all text-slate-700`}
                  placeholder={loc.fChildAgePl}
                />
                {errors.childAge && (
                  <p className="text-xs text-red-500 mt-1">{errors.childAge}</p>
                )}
              </div>
            </div>

            {/* Kebutuhan */}
            <div>
              <label htmlFor="learningNeeds" className="block text-sm font-medium text-slate-600 mb-1.5">
                {loc.fNeeds}
              </label>
              <input
                id="learningNeeds"
                type="text"
                value={formData.learningNeeds}
                onChange={(e) => handleChange("learningNeeds", e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-[var(--radius-button)] border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all text-slate-700"
                placeholder={loc.fNeedsPl}
              />
            </div>

            {/* Pesan */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-600 mb-1.5">
                {loc.fMessage}
              </label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-[var(--radius-button)] border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all resize-none text-slate-700"
                placeholder={loc.fMessagePl}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 rounded-[var(--radius-button)] shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {loc.submitSending}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {loc.submitSend}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
