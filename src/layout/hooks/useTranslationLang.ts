import { useNav } from "./useNav";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { watch, onBeforeMount, type Ref, getCurrentInstance } from "vue";

export function useTranslationLang(ref?: Ref) {
  const { $storage, changeTitle, handleResize } = useNav();
  const { locale, t } = useI18n();
  const route = useRoute();
  const { globalProperties } = getCurrentInstance()!.appContext.config;

  function translationCh() {
    $storage.locale = { locale: "zh" };
    globalProperties.$changeLocale("zh");
    locale.value = "zh";
    ref && handleResize(ref.value);
  }

  function translationEn() {
    $storage.locale = { locale: "en" };
    globalProperties.$changeLocale("en");
    locale.value = "en";
    ref && handleResize(ref.value);
  }

  watch(
    () => locale.value,
    () => {
      changeTitle(route.meta);
    }
  );

  onBeforeMount(() => {
    locale.value = $storage.locale?.locale ?? "zh";
    globalProperties.$changeLocale(locale.value);
  });

  return {
    t,
    route,
    locale,
    translationCh,
    translationEn
  };
}
