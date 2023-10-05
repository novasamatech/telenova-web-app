import Image from 'next/image'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}
) {
  return (
    <section>
        <nav></nav>
        {children}
    </section>
  )
}
