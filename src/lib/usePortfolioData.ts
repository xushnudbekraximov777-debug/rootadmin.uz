import { useEffect, useState } from "react";
import { supabase, PROFILE_ID, SETTINGS_ID } from "./supabase";
import type {
  Profile,
  Experience,
  Education,
  Certification,
  Skill,
  Project,
  Settings,
} from "./types";

export type PortfolioData = {
  profile: Profile | null;
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  skills: Skill[];
  projects: Project[];
  settings: Settings | null;
  loading: boolean;
  error: string | null;
};

export function usePortfolioData(): PortfolioData {
  const [data, setData] = useState<PortfolioData>({
    profile: null,
    experiences: [],
    education: [],
    certifications: [],
    skills: [],
    projects: [],
    settings: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    (async () => {
      const [
        { data: profile },
        { data: experiences },
        { data: education },
        { data: certifications },
        { data: skills },
        { data: projects },
        { data: settings },
      ] = await Promise.all([
        supabase.from("profile").select("*").eq("id", PROFILE_ID).maybeSingle(),
        supabase.from("experiences").select("*").order("sort_order", { ascending: true }),
        supabase.from("education").select("*").order("sort_order", { ascending: true }),
        supabase.from("certifications").select("*").order("sort_order", { ascending: true }),
        supabase.from("skills").select("*").order("sort_order", { ascending: true }),
        supabase.from("projects").select("*").order("sort_order", { ascending: true }),
        supabase.from("settings").select("*").eq("id", SETTINGS_ID).maybeSingle(),
      ]);

      setData({
        profile: profile as Profile | null,
        experiences: (experiences as Experience[]) ?? [],
        education: (education as Education[]) ?? [],
        certifications: (certifications as Certification[]) ?? [],
        skills: (skills as Skill[]) ?? [],
        projects: (projects as Project[]) ?? [],
        settings: settings as Settings | null,
        loading: false,
        error: null,
      });

      // increment view counter (fire and forget)
      await supabase.from("profile_views").insert({});

    })();
  }, []);

  return data;
}
