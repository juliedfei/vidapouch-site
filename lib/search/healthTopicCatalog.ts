export type HealthTopicCategory =
 | "Popular Goals"
 | "General Wellness"
 | "Women’s Health"
 | "Men’s Health"
 | "Healthy Aging"
 | "Life Stages"
 | "Health Conditions";

export type HealthTopicType =
 | "health-goal"
 | "health-condition"
 | "life-stage";

export type HealthTopic = {
 id:
   string;

 label:
   string;

 searchQuery:
   string;

 category:
   HealthTopicCategory;

 type:
   HealthTopicType;

 description:
   string;
};

export const HEALTH_TOPIC_CATEGORY_ORDER:
 HealthTopicCategory[] = [
   "Popular Goals",
   "General Wellness",
   "Women’s Health",
   "Men’s Health",
   "Healthy Aging",
   "Life Stages",
   "Health Conditions",
 ];

export const HEALTH_TOPICS:
 HealthTopic[] = [
   {
     id:
       "sleep",

     label:
       "Sleep",

     searchQuery:
       "Sleep",

     category:
       "Popular Goals",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with sleep quality and relaxation.",
   },
   {
     id:
       "energy",

     label:
       "Energy",

     searchQuery:
       "Energy",

     category:
       "Popular Goals",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with energy production and fatigue support.",
   },
   {
     id:
       "stress",

     label:
       "Stress",

     searchQuery:
       "Stress",

     category:
       "Popular Goals",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with stress management and relaxation.",
   },
   {
     id:
       "focus",

     label:
       "Focus & Brain Health",

     searchQuery:
       "Focus and brain health",

     category:
       "Popular Goals",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with focus, memory, and cognitive wellness.",
   },
   {
     id:
       "gut-health",

     label:
       "Gut Health",

     searchQuery:
       "Gut health",

     category:
       "Popular Goals",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with digestion and gastrointestinal wellness.",
   },
   {
     id:
       "immunity",

     label:
       "Immunity",

     searchQuery:
       "Immunity",

     category:
       "Popular Goals",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with immune-system wellness.",
   },
   {
     id:
       "mood",

     label:
       "Mood",

     searchQuery:
       "Mood support",

     category:
       "General Wellness",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with mood and emotional wellness.",
   },
   {
     id:
       "heart-health",

     label:
       "Heart Health",

     searchQuery:
       "Heart health",

     category:
       "General Wellness",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with cardiovascular wellness.",
   },
   {
     id:
       "bone-health",

     label:
       "Bone Health",

     searchQuery:
       "Bone health",

     category:
       "General Wellness",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with bone strength and mineral support.",
   },
   {
     id:
       "joint-support",

     label:
       "Joint Support",

     searchQuery:
       "Joint support",

     category:
       "General Wellness",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with joint comfort and mobility.",
   },
   {
     id:
       "skin-hair-nails",

     label:
       "Skin, Hair & Nails",

     searchQuery:
       "Skin hair and nails",

     category:
       "General Wellness",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with skin, hair, and nail wellness.",
   },
   {
     id:
       "hydration",

     label:
       "Hydration",

     searchQuery:
       "Hydration",

     category:
       "General Wellness",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with hydration and electrolyte balance.",
   },
   {
     id:
       "metabolism",

     label:
       "Metabolism",

     searchQuery:
       "Metabolism support",

     category:
       "General Wellness",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with metabolic wellness.",
   },
   {
     id:
       "muscle-strength",

     label:
       "Muscle & Strength",

     searchQuery:
       "Muscle and strength",

     category:
       "General Wellness",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with muscle performance and strength.",
   },
   {
     id:
       "exercise-recovery",

     label:
       "Exercise Recovery",

     searchQuery:
       "Exercise recovery",

     category:
       "General Wellness",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with post-exercise recovery.",
   },
   {
     id:
       "endurance",

     label:
       "Endurance",

     searchQuery:
       "Endurance",

     category:
       "General Wellness",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with stamina and endurance.",
   },
   {
     id:
       "eye-health",

     label:
       "Eye Health",

     searchQuery:
       "Eye health",

     category:
       "General Wellness",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with vision and eye wellness.",
   },
   {
     id:
       "liver-health",

     label:
       "Liver Health",

     searchQuery:
       "Liver health",

     category:
       "General Wellness",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with liver wellness.",
   },
   {
     id:
       "womens-wellness",

     label:
       "Women’s Wellness",

     searchQuery:
       "Women's wellness",

     category:
       "Women’s Health",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with women’s general wellness.",
   },
   {
     id:
       "menstrual-wellness",

     label:
       "Menstrual Wellness",

     searchQuery:
       "Menstrual wellness",

     category:
       "Women’s Health",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with menstrual wellness.",
   },
   {
     id:
       "menopause",

     label:
       "Menopause",

     searchQuery:
       "Menopause",

     category:
       "Women’s Health",

     type:
       "life-stage",

     description:
       "Explore supplement categories that may be relevant during menopause.",
   },
   {
     id:
       "mens-wellness",

     label:
       "Men’s Wellness",

     searchQuery:
       "Men's wellness",

     category:
       "Men’s Health",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with men’s general wellness.",
   },
   {
     id:
       "prostate-health",

     label:
       "Prostate Health",

     searchQuery:
       "Prostate health",

     category:
       "Men’s Health",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with prostate wellness.",
   },
   {
     id:
       "healthy-aging",

     label:
       "Healthy Aging",

     searchQuery:
       "Healthy aging",

     category:
       "Healthy Aging",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with healthy aging.",
   },
   {
     id:
       "memory-support",

     label:
       "Memory Support",

     searchQuery:
       "Memory support",

     category:
       "Healthy Aging",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with memory and cognitive wellness.",
   },
   {
     id:
       "mobility",

     label:
       "Mobility",

     searchQuery:
       "Mobility support",

     category:
       "Healthy Aging",

     type:
       "health-goal",

     description:
       "Explore supplements commonly associated with mobility and physical function.",
   },
   {
     id:
       "pregnancy",

     label:
       "Pregnancy",

     searchQuery:
       "Pregnancy",

     category:
       "Life Stages",

     type:
       "life-stage",

     description:
       "Explore nutrient categories that may be relevant during pregnancy.",
   },
   {
     id:
       "postpartum",

     label:
       "Postpartum",

     searchQuery:
       "Postpartum",

     category:
       "Life Stages",

     type:
       "life-stage",

     description:
       "Explore nutrient categories that may be relevant during the postpartum period.",
   },
   {
     id:
       "breastfeeding",

     label:
       "Breastfeeding",

     searchQuery:
       "Breastfeeding",

     category:
       "Life Stages",

     type:
       "life-stage",

     description:
       "Explore nutrient categories that may be relevant while breastfeeding.",
   },
   {
     id:
       "older-adults",

     label:
       "Older Adults",

     searchQuery:
       "Nutrition for older adults",

     category:
       "Life Stages",

     type:
       "life-stage",

     description:
       "Explore nutrient categories commonly considered for older adults.",
   },
   {
     id:
       "ataxia",

     label:
       "Ataxia",

     searchQuery:
       "Ataxia",

     category:
       "Health Conditions",

     type:
       "health-condition",

     description:
       "Explore supplement categories that may be relevant to certain causes or subtypes of ataxia.",
   },
   {
     id:
       "iron-deficiency",

     label:
       "Iron Deficiency",

     searchQuery:
       "Iron deficiency",

     category:
       "Health Conditions",

     type:
       "health-condition",

     description:
       "Explore supplement categories that may be relevant to diagnosed iron deficiency.",
   },
   {
     id:
       "vitamin-b12-deficiency",

     label:
       "Vitamin B12 Deficiency",

     searchQuery:
       "Vitamin B12 deficiency",

     category:
       "Health Conditions",

     type:
       "health-condition",

     description:
       "Explore supplement categories that may be relevant to diagnosed vitamin B12 deficiency.",
   },
   {
     id:
       "osteoporosis",

     label:
       "Osteoporosis",

     searchQuery:
       "Osteoporosis",

     category:
       "Health Conditions",

     type:
       "health-condition",

     description:
       "Explore nutrient categories that may be relevant to bone-health management.",
   },
   {
     id:
       "high-cholesterol",

     label:
       "High Cholesterol",

     searchQuery:
       "High cholesterol",

     category:
       "Health Conditions",

     type:
       "health-condition",

     description:
       "Explore supplement categories sometimes considered alongside cholesterol management.",
   },
   {
     id:
       "migraine",

     label:
       "Migraine",

     searchQuery:
       "Migraine",

     category:
       "Health Conditions",

     type:
       "health-condition",

     description:
       "Explore supplement categories that may be relevant to some people with migraine.",
   },
 ];

export function getHealthTopicsByCategory(
 category:
   HealthTopicCategory
) {
 return HEALTH_TOPICS.filter(
   (topic) =>
     topic.category ===
     category
 );
}

export function searchHealthTopics(
 query:
   string
) {
 const normalizedQuery =
   query
     .trim()
     .toLowerCase();

 if (
   !normalizedQuery
 ) {
   return HEALTH_TOPICS;
 }

 return HEALTH_TOPICS.filter(
   (topic) =>
     topic.label
       .toLowerCase()
       .includes(
         normalizedQuery
       ) ||
     topic.description
       .toLowerCase()
       .includes(
         normalizedQuery
       ) ||
     topic.category
       .toLowerCase()
       .includes(
         normalizedQuery
       )
 );
}
