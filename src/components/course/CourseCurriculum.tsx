import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Rule } from '@/components/ui/Rule'
import { Reveal } from '@/components/motion/Reveal'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'

interface CurriculumModule {
  title: string
  description: string | null
}

interface CourseCurriculumProps {
  modules: CurriculumModule[]
  heading: string
  tone: 'porcelain' | 'shell'
}

/** Renders nothing when `modules` is empty — true for every real course
 * today (no curriculum has been entered in Payload yet). No placeholder
 * module content is ever invented to fill the section. */
export function CourseCurriculum({ modules, heading, tone }: CourseCurriculumProps) {
  if (modules.length === 0) return null

  return (
    <Section tone={tone} spacing="md">
      <Container width="editorial">
        <Reveal y={0}>
          <Heading as="h2" size="lg" className="mb-10">
            {heading}
          </Heading>
        </Reveal>

        <StaggerGroup className="flex flex-col" staggerDelay={0.07}>
          {modules.map((module, i) => (
            <StaggerItem key={module.title} y={12}>
              {i > 0 && <Rule tone="champagne" className="opacity-60" />}
              <div className="py-6">
                <Text size="sm" tone="muted" className="mb-2 font-medium">
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <Heading as="h3" size="sm" className="mb-2">
                  {module.title}
                </Heading>
                {module.description && (
                  <Text tone="muted" className="max-w-2xl">
                    {module.description}
                  </Text>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  )
}
