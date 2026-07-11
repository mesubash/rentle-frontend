export type ListingType = "Product" | "Service";

export type Listing = {
  slug: string;
  title: string;
  type: ListingType;
  category: string;
  price: number;
  unit: "day" | "hour" | "event";
  deposit: number;
  district: string;
  area: string;
  rating: number;
  reviewCount: number;
  owner: string;
  image: string;
  alt: string;
};

export const images = {
  canon: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvKTbCBQC33YckfN6EJF2IN_E5un1jlS4rp4RfNGoKYN_PVgeOpA0fETbEuGFFbXQl5O2tc52sQM7o0nD10HMEN7nTcvCM2w-N0KlTGHdJWO2Y2or2EOleOyhXCL0Nvnd1Hb8jMOZsPMF-Xz4UwrXk26OnIZcQs2GBr0SJpX2EfbojKrSteRegSjO2d6egQd53Hj-HY0FoLXbnxrkXdikSP9kzKmWkelxWpqzqUPLH8xhKOMpc_kl5",
  daura: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGQ9pXskizM9yo2U7zR2k5rtZdzb3U3TjyJ_vMebGMPlpvMMAsV-6vj_4kd6-83eU9opI13EikXYWaVZqDr0rGrXkZiXsYgMSmT9AZRtw2KszBnFhUJQUC0RYauNa0_PjBhztnufPwpmY9jWwOqY7Byg4Q-oXS1B2QdkQbvZLfIgN1aFECFGsZAYDEqiIHo9OErs3CarkzMUEAUbiTc0cMouyqAOgtXIWX-gXcZGs_2akJxJ6lRfos",
  tent: "https://lh3.googleusercontent.com/aida-public/AB6AXuCR4gIuM3syvaSgZLlIYTHmWHuZGkjxSkVdcQBXG9nmVZq_bMWScmijSbtCtopnoLDq_ZGdvVTKxT-m-FvUZUVOoFqExPzHkQAeF2n8p-LlOlDDm6YNwi0Nf8wYWnxM17kDcrg-ebS1Dd0FzShzMEIsky4bqLxUoFMLmrL82tNjzPVFPpXiqqFDBZm0NBsVmi-36G9mHtHrt2UgU5mCA68aFFia_VE0FxU0L5lyIMRumqfNkak7z6Hy",
  drill: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWPIlaRwPj2E1hXU8-oe5UdUv7_OdcrBHLaBpkAYUpvu7NUdwf_w8fW88v3yP8Y6FMwekr6x2lZRc7MiQXuuKZyydcyqL09Ee77HATwBwnMRrxq0kRDQeuED_6h-H1K3lUZ3Q8ZVwAYhyV_1HFtEyyhXuPgcJFqzveE_FyhGR5Ct8JRn0qN-NgHa_B8vFszVVZlxit-p1dVgphypH6EOX2w9l1Gh9HDhKaq6ionXL4IDc_6DiGZHqq",
  drone: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwRSAu-iBJ3_ZwdJ2Bp1ReTZ7mfHjlJ9Ki_SyhBBi4yEx4PPY8EsPVq-lHwI_PSimyVogIHckLhyseWHAvD9kL5fU1UK-8Xx0vz8rZZqJPHVJbmU4ONhoWMdG9R6u37BpUTyEmrW6Gg6L7qjwhJWz_v1OxzeOSTyOMgprBwboxAcjeMNLmfyHpIEGA1O27-q9k0uLJU7E2Xw7aSXfKfmPLBzjs_WwX_WdsapAmHYVOylQaD20AXNn3",
  sony: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzY5Hd-DSj6-rPDd39ZhjTXR5HORavscGhTVNjNJohFE-pjlQnDWdA0AQ1PpSCPKbFjhKcrNLZuKggcGAxoUqFWZLxs27ZQKlI1j1Z2zBoC4R-KN1ZnGKt988-txDZ-FyCBXZv8VaTiLA4MvPFsBB86hPrtW2C9u2zARhbM1qh3H_e5uc4jXXWQL1EOUsNxAiDdhJpISkDFj7ANyuFeYZTDApiLbZYAymlTcAsR4yuvWaGqAifvir2",
  sonyTop: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLLIZXaYdnvRmqfTMo56gJK1EYxZcMWBxJ-PsJ_avm2SkeKgAYfLDP0BC2lh8xk-_Yn6cSrpqerftlUBfLU4ZsRbRFNahoM_Yl0ySXoinQfC5Q0rlQa129URhVPeMseB2XvStcTKDAWdOvFs1-nhyYkkLM4gLbEs3xlQ162d8x1PTehpn1lWNVGKZuvRolT7DguECKeJqOSPB64Qs2SDivTkS0_ZuHJpxowf9lYFOH4XLHJVLCgKFN",
  sonyRear: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQpYznBavcc8UeBMmEFSbakTA8zXTtKgVJGg7KSeZEBCfyrZ5OjPZFsGugSI-gavRv2055Im6dsfVxzkXwtsfoxQss88Pz0mP_spAUphSn_WiwSvc8z78DI9I59bDqmSJWa5lnPbfAPAV238j2q2LEDbrQqij_9DRqIPgsrBfP4Sv3c39dofqelAjxQQSjyVUCMPxeDvQSX9zW5SU0qIKJbS98L_byorHJzjPlskSU8egMHdedUm8g",
  sonyLens: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT8Qn27iRKAwPjBrdwSF4G4c7OBwYTAZOg_0YW3zrDZ_e_VAs1wNl11-wRUzdgOENoiW5jyTKnA4qdjK-0gUwnwnaUbxiVBiYMXq9aYXBy4QZtp8v2IXAuA8b5Zr33GuQql70QN0fpzpLGMQ5nWrgNrPl5FIiERzmBLMupc854vS_2xrhvxQPo9dky9mzEUcE6Zrr331tKR0E5wjdAf0ae2lzCxtuqSgj36vAy8ByxH1FZQKICJJ-y",
  sonyHands: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOIL3eNaHI38yO1GbwpYl9scJDMXgsY4uf2WS03DPw17qbzJyvraoNMu40p5kneiqM6cJIP0REedJtEDpsWpd5tafIlxTxpa0wstCqjtneIlyhHBsLKf_IgbF8pxU4MP4VfY-TIFy2pT71KvzMqOybepNEqBYELPWLW0LOKq8SNIIcF1cMSyjiMVcyOWEjVdzxIPRTiOjepOxEksmLRXEgt-uVrEP8KXoKe9nHAUZPLO6yGtIXYKNa",
  sarah: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqjIH5MHf5wsFjp3-N0E6taGM8q77n6bU1N24QRMCTRYZjHew4hcIfqyXm8i_2HBdreDQHg9dqMZCyfCl2CryCBplzunjKUeN2mr0hhB8PP1AcjXwGSlghADUNAS-54sv5wqUt4GvY4qjDE-4S9OZFM0DSCSoMF6zIFwP2-NtNgkcy906qvHjEEU2-I8tXIBxV1jpDV3JBIxh16lSvJWoTcqdFR8F-ZEqRU0Tr6KakKo81QnCJFbRo",
};

export const listings: Listing[] = [
  { slug: "sony-alpha-a7-iv", title: "Sony Alpha A7 IV Camera", type: "Product", category: "Cameras & Tech", price: 2500, unit: "day", deposit: 30000, district: "Kathmandu", area: "Baneshwor", rating: 4.9, reviewCount: 36, owner: "Sarah M.", image: images.sony, alt: "Sony Alpha A7 IV camera on a warm wood table" },
  { slug: "canon-eos-r5", title: "Canon EOS R5 Mirrorless Camera", type: "Product", category: "Cameras & Tech", price: 1500, unit: "day", deposit: 25000, district: "Kathmandu", area: "New Road", rating: 4.9, reviewCount: 49, owner: "Nabin K.", image: images.canon, alt: "Canon EOS R5 camera with lens on a light wood table" },
  { slug: "daura-suruwal", title: "Traditional Daura Suruwal Set", type: "Product", category: "Traditional Clothing", price: 800, unit: "day", deposit: 5000, district: "Lalitpur", area: "Patan", rating: 4.8, reviewCount: 22, owner: "Aayush S.", image: images.daura, alt: "Traditional Nepali daura suruwal hanging against a warm wall" },
  { slug: "camping-tent", title: "Four-Person Camping Tent", type: "Product", category: "Tools & Camping", price: 1200, unit: "day", deposit: 10000, district: "Pokhara", area: "Lakeside", rating: 4.8, reviewCount: 31, owner: "Suman G.", image: images.tent, alt: "Four-person camping tent pitched on grass" },
  { slug: "bosch-drill", title: "Bosch Professional Drill Set", type: "Product", category: "Tools & Camping", price: 500, unit: "day", deposit: 6000, district: "Bhaktapur", area: "Suryabinayak", rating: 4.7, reviewCount: 18, owner: "Roshan P.", image: images.drill, alt: "Bosch power drill set in a clean workshop" },
  { slug: "event-photography", title: "Wedding & Event Photography", type: "Service", category: "Event & Photography", price: 4500, unit: "event", deposit: 5000, district: "Kathmandu", area: "Maharajgunj", rating: 5, reviewCount: 28, owner: "Riya Shrestha", image: images.sonyHands, alt: "Photographer adjusting the lens of a Sony camera" },
];

export const bookingSteps = ["Requested", "Approved", "Deposit pending", "Active", "Completed"];

export function formatNpr(value: number) {
  return `NPR ${new Intl.NumberFormat("en-NP").format(value)}`;
}
