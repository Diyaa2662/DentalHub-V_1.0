import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="border rounded px-3 py-1"
    >
      <option value="en">🇬🇧 English</option>
      <option value="sv">🇸🇪 Svenska</option>
    </select>
  );
}
