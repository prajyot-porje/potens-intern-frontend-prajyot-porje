"use client";

import React, { useState } from "react";
import { Sun, Moon, Laptop, Languages, Activity } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useLanguage } from "../hooks/useLanguage";
import { DisplayText, Heading, ParagraphText, MonoText } from "../components/typography";
import { Button, Card, Input, TextArea, Divider, IconWrapper, Section } from "../components/primitives";

export default function Home() {
  const { theme, resolvedTheme, setTheme, toggleTheme, isSystem } = useTheme();
  const { locale, setLanguage, t } = useLanguage();
  const [testInput, setTestInput] = useState("");
  const [testArea, setTestArea] = useState("");

  const cycleLanguage = () => {
    setLanguage(locale === "en" ? "mr" : "en");
  };

  return (
    <div className="flex flex-col flex-1 py-space-6">
      {/* Header section with theme/lang controls */}
      <header className="flex items-center justify-between border-b border-border pb-space-4">
        <div className="flex items-center gap-space-2">
          <IconWrapper icon={Activity} className="text-text-primary" />
          <Heading level={2} className="!text-lg">
            {t("common.appTitle")}
          </Heading>
        </div>
        <div className="flex gap-space-2">
          {/* Language Toggle */}
          <Button
            variant="secondary"
            className="!min-h-[40px] !h-[40px] !px-space-3 text-xs"
            onClick={cycleLanguage}
            aria-label="Toggle language"
          >
            <IconWrapper icon={Languages} className="mr-space-1 h-3.5 w-3.5" />
            {t("common.toggleLanguage")}
          </Button>

          {/* Theme Cycle Toggle */}
          <Button
            variant="secondary"
            className="!min-h-[40px] !h-[40px] !w-[40px] !p-0"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <IconWrapper
              icon={resolvedTheme === "light" ? Moon : Sun}
              className="h-4 w-4"
            />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-space-6">
        <Section spacing="space-4">
          <DisplayText size="medium" className="mb-space-2">
            Foundation Ready
          </DisplayText>
          <ParagraphText variant="large">
            All design systems, providers, hooks, and primitive components are fully configured.
          </ParagraphText>
        </Section>

        {/* State Verification Grid */}
        <Section spacing="space-6">
          <Heading level={1} className="mb-space-4">
            System State
          </Heading>
          
          <div className="grid grid-cols-2 gap-space-4">
            <Card className="flex flex-col gap-space-1">
              <ParagraphText variant="caption" className="uppercase tracking-wider">
                Language
              </ParagraphText>
              <ParagraphText variant="uiLabel" className="!text-text-primary text-base">
                {locale === "en" ? "English (en)" : "मराठी (mr)"}
              </ParagraphText>
            </Card>

            <Card className="flex flex-col gap-space-1">
              <ParagraphText variant="caption" className="uppercase tracking-wider">
                Theme
              </ParagraphText>
              <ParagraphText variant="uiLabel" className="!text-text-primary text-base capitalize">
                {theme} ({resolvedTheme})
              </ParagraphText>
            </Card>
          </div>
        </Section>

        {/* Primitive Showcase */}
        <Section spacing="space-6">
          <Heading level={1} className="mb-space-4">
            Primitives Showcase
          </Heading>

          <div className="flex flex-col gap-space-6">
            {/* Buttons Row */}
            <div className="flex flex-col gap-space-2">
              <ParagraphText variant="uiLabel">Buttons</ParagraphText>
              <div className="flex flex-wrap gap-space-2">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="error">Destructive</Button>
              </div>
            </div>

            <Divider />

            {/* Inputs Section */}
            <div className="flex flex-col gap-space-4">
              <div>
                <ParagraphText variant="uiLabel" className="mb-space-1">
                  Text Input
                </ParagraphText>
                <Input
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder={t("form.descriptionPlaceholder")}
                />
              </div>

              <div>
                <ParagraphText variant="uiLabel" className="mb-space-1">
                  Text Area
                </ParagraphText>
                <TextArea
                  value={testArea}
                  onChange={(e) => setTestArea(e.target.value)}
                  placeholder="Enter details..."
                />
              </div>
            </div>

            <Divider />

            {/* Typography Stack */}
            <div className="flex flex-col gap-space-3">
              <ParagraphText variant="uiLabel">Typography Ramps</ParagraphText>
              
              <Card className="flex flex-col gap-space-3">
                <div>
                  <ParagraphText variant="caption">Display Medium</ParagraphText>
                  <DisplayText size="medium">Nagrik Display</DisplayText>
                </div>
                <div>
                  <ParagraphText variant="caption">Heading 1</ParagraphText>
                  <Heading level={1}>Nagrik Heading 1</Heading>
                </div>
                <div>
                  <ParagraphText variant="caption">Heading 2</ParagraphText>
                  <Heading level={2}>Nagrik Heading 2</Heading>
                </div>
                <div>
                  <ParagraphText variant="caption">Body Large</ParagraphText>
                  <ParagraphText variant="large">
                    Instrument Sans is the secondary typeface for body copy and forms.
                  </ParagraphText>
                </div>
                <div>
                  <ParagraphText variant="caption">Reference ID (Geist Mono)</ParagraphText>
                  <div>
                    <MonoText>RD-7X9K2</MonoText>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border pt-space-4 flex justify-between items-center">
        <ParagraphText variant="caption">
          Potens Internship Program
        </ParagraphText>
        <MonoText className="text-xs text-text-tertiary">
          v0.1.0-alpha
        </MonoText>
      </footer>
    </div>
  );
}
