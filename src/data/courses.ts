import { Course } from "../types";

export const COURSES: Course[] = [
  {
    id: "course-1",
    title: "Introduction to React & Modern UI Development",
    description: "Learn the fundamentals of component-driven architecture, state management, and modern hooks in React 19.",
    category: "Tech",
    level: "Beginner",
    duration: "10 hours",
    rating: 4.8,
    instructor: "Sarah Jenkins",
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c1-m1",
        title: "Understanding Components & Props",
        description: "An introduction to custom React functional components, props distribution, and architectural reuse.",
        videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0",
        duration: "45 mins",
        quiz: {
          questions: [
            {
              id: "c1-m1-q1",
              question: "What is the primary way data flows from a parent component to child components in React?",
              options: ["Via local storage", "Via state", "Via props", "Via contextual API"],
              answerIndex: 2,
              explanation: "React relies on a uni-directional data flow, where props are passed down from parent to child."
            },
            {
              id: "c1-m1-q2",
              question: "Are React components allowed to mutate their own props directly?",
              options: ["Yes, constantly", "Only when using strictMode", "No, props are read-only", "Yes, if they are defined as let"],
              answerIndex: 2,
              explanation: "Props are immutable. If you need dynamic values, you should use React state instead."
            }
          ]
        }
      },
      {
        id: "c1-m2",
        title: "Managing State with Hooks",
        description: "Mastering the useState and useEffect hooks for building responsive, stateful client-side dashboards.",
        videoUrl: "https://www.youtube.com/embed/dpw9EHDh2bM",
        duration: "55 mins",
        quiz: {
          questions: [
            {
              id: "c1-m2-q1",
              question: "What does the useState hook return?",
              options: [
                "The current state value only",
                "An array containing the state value and a updater function",
                "An object containing the state value and its key",
                "A dispatch subscription function"
              ],
              answerIndex: 1,
              explanation: "useState returns an array with exactly two elements: the current state and a function to update it."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-2",
    title: "Data Structures and Algorithms Masterclass",
    description: "A comprehensive guide to sorting, searching, trees, dynamic programming, and computing complexity metrics.",
    category: "Tech",
    level: "Advanced",
    duration: "16 hours",
    rating: 4.9,
    instructor: "Dr. Alan Turing",
    thumbnailUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2020?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c2-m1",
        title: "Big O Notation and Complexity Analysis",
        description: "Analyze the runtime scalability and memory consumption patterns across popular data structures.",
        videoUrl: "https://www.youtube.com/embed/V6mKVRU1evU",
        duration: "50 mins",
        quiz: {
          questions: [
            {
              id: "c2-m1-q1",
              question: "What is the time complexity of searching in a perfectly balanced binary search tree?",
              options: ["O(1)", "O(N)", "O(log N)", "O(N log N)"],
              answerIndex: 2,
              explanation: "A balanced binary search tree halves the search space at each level, leading to logarithmic complexity, O(log N)."
            }
          ]
        }
      },
      {
        id: "c2-m2",
        title: "Sorting Algorithms In-Depth",
        description: "Deep dive into QuickSort, MergeSort, and selection sorting models.",
        videoUrl: "https://www.youtube.com/embed/RfXt_qHDEP4",
        duration: "1 hour",
        quiz: {
          questions: [
            {
              id: "c2-m2-q1",
              question: "Which of the following sorting algorithms operates with O(N log N) worst-case time complexity?",
              options: ["Bubble Sort", "Merge Sort", "Quick Sort", "Insertion Sort"],
              answerIndex: 1,
              explanation: "Merge Sort guarantees O(N log N) time complexity even in the worst case by recursively splitting and merging arrays."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-3",
    title: "Mastering Tailwind CSS v4",
    description: "Design high-end, responsive layouts using utility-first styling classes and CSS custom properties.",
    category: "Design",
    level: "Beginner",
    duration: "6 hours",
    rating: 4.7,
    instructor: "Leo Dupont",
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c3-m1",
        title: "Tailwind Core Architecture & Theme System",
        description: "Learn how `@import 'tailwindcss';` replaces old configurations and provides CSS-native theme variables.",
        videoUrl: "https://www.youtube.com/embed/m91MvAtbKGA",
        duration: "40 mins",
        quiz: {
          questions: [
            {
              id: "c3-m1-q1",
              question: "How is Tailwind CSS v4 mainly integrated into a CSS file?",
              options: ["Using @use 'tailwind';", "Using @import 'tailwindcss';", "Using npm script linkers only", "Via postcss plugins exclusively"],
              answerIndex: 1,
              explanation: "Tailwind CSS v4 introduces a streamlined direct CSS import directive: `@import 'tailwindcss';`."
            }
          ]
        }
      },
      {
        id: "c3-m2",
        title: "Creating High-End Glassmorphic Cards",
        description: "Apply backdrop filters, subtle outer borders, and responsive grid patterns.",
        videoUrl: "https://www.youtube.com/embed/z6_SgAn9_fM",
        duration: "45 mins",
        quiz: {
          questions: [
            {
              id: "c3-m2-q1",
              question: "Which Tailwind utility class applies a blurred filter to the element background?",
              options: ["blur-lg", "backdrop-blur-md", "filter-blur", "bg-opaque-filter"],
              answerIndex: 1,
              explanation: "backdrop-blur-* classes apply a graphical blur filter to the content behind the element."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-4",
    title: "Modern Generative AI & Prompt Engineering",
    description: "Unravel the mechanics of Large Language Models and learn optimal phrasing strategies for developers.",
    category: "AI",
    level: "Beginner",
    duration: "8 hours",
    rating: 4.9,
    instructor: "Emilia Clarke",
    thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c4-m1",
        title: "Mechanism of Transformers",
        description: "Understand neural self-attention layers, tokens, and multi-headed parameters.",
        videoUrl: "https://www.youtube.com/embed/SZorAJ4I-sA",
        duration: "50 mins",
        quiz: {
          questions: [
            {
              id: "c4-m1-q1",
              question: "What core mechanism allows Transformers to weigh dependencies between far-away tokens in a sequence?",
              options: ["Hidden recurrent cells", "Stochastic descent", "Self-Attention", "Backpropagation feeds"],
              answerIndex: 2,
              explanation: "The self-attention mechanism enables the model to focus on relevant context words dynamically regardless of their distance."
            }
          ]
        }
      },
      {
        id: "c4-m2",
        title: "Few-Shot and Chain-of-Thought Prompting",
        description: "Learn advanced patterns to extract reasoning traces and consistent formats from models.",
        videoUrl: "https://www.youtube.com/embed/39Z7hCg0L9c",
        duration: "50 mins",
        quiz: {
          questions: [
            {
              id: "c4-m2-q1",
              question: "What does Chain-of-Thought prompting explicitly instruct the model to do?",
              options: ["Generate code comments first", "Spell-check the instructions", "Draft step-by-step reasoning before answering", "Limit response length to 10 tokens"],
              answerIndex: 2,
              explanation: "Chain-of-Thought prompting asks the model to output its rational steps sequentially, boosting reasoning accuracy."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-5",
    title: "Python for Deep Learning & Neural Networks",
    description: "Build, configure, and train Multi-Layer Perceptrons and Convolutional Networks from scratch using PyTorch.",
    category: "AI",
    level: "Intermediate",
    duration: "14 hours",
    rating: 4.8,
    instructor: "Nikolas Tesla",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c5-m1",
        title: "Tensors and Computational Graphs",
        description: "Learn PyTorch tensor manipulation, autograd tracking, and standard backend tensor computations.",
        videoUrl: "https://www.youtube.com/embed/GIsg-ZUy0MY",
        duration: "1 hour",
        quiz: {
          questions: [
            {
              id: "c5-m1-q1",
              question: "What does the PyTorch autograd engine automate?",
              options: ["Hyperparameter selection", "Gradient calculation for backpropagation", "Data loader pipeline structuring", "Model weights encryption"],
              answerIndex: 1,
              explanation: "Autograd tracks custom tensor equations and automatically computes partial derivative gradients during backward cycles."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-6",
    title: "Advanced TypeScript Practices for Enterprise Apps",
    description: "Master complex types, discriminated unions, utility generics, and structural mapping rules.",
    category: "Tech",
    level: "Advanced",
    duration: "11 hours",
    rating: 4.8,
    instructor: "Anders Hejlsberg",
    thumbnailUrl: "https://images.unsplash.com/photo-1516116211223-5c359a36298a?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c6-m1",
        title: "Discriminated Unions & Brand Types",
        description: "Enforce complete, safe control flows inside type compilers using literal key triggers.",
        videoUrl: "https://www.youtube.com/embed/d56mG7DezGs",
        duration: "40 mins",
        quiz: {
          questions: [
            {
              id: "c6-m1-q1",
              question: "How does TypeScript identify a discriminated union?",
              options: ["By tracking numeric lengths", "By looking for a common literal property designated as a discriminant", "By scanning file imports", "By analyzing comments"],
              answerIndex: 1,
              explanation: "Discriminated unions leverage a common single literal field (e.g. type: 'success' | 'error') to safely narrow object types."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-7",
    title: "Digital Marketing & SEO Mastery",
    description: "Empower web brands by mastering programmatic keyword targeting, high-converting copy, and web indexing profiles.",
    category: "Marketing",
    level: "Beginner",
    duration: "9 hours",
    rating: 4.6,
    instructor: "Neil Patel",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c7-m1",
        title: "On-Page SEO and Core Web Vitals",
        description: "Optimizing DOM structures, metadata tags, cumulative layout shifts, and mobile viewport responsive configurations.",
        videoUrl: "https://www.youtube.com/embed/nU-IIX3hyHM",
        duration: "45 mins",
        quiz: {
          questions: [
            {
              id: "c7-m1-q1",
              question: "Which Core Web Vital measures the visual stability of a webpage loading layout?",
              options: ["First Contentful Paint (FCP)", "Largest Contentful Paint (LCP)", "Cumulative Layout Shift (CLS)", "Time to Interactive (TTI)"],
              answerIndex: 2,
              explanation: "CLS captures unexpected structural changes in the visual DOM canvas as elements populate, defining layout stability."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-8",
    title: "UI/UX Design Fundamentals on Figma",
    description: "Align color schemes, spatial padding vectors, auto-layouts, and design system components on Figma.",
    category: "Design",
    level: "Beginner",
    duration: "7 hours",
    rating: 4.7,
    instructor: "Elena Kovalenko",
    thumbnailUrl: "https://images.unsplash.com/photo-1541462608141-2758733e30bc?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c8-m1",
        title: "Figma Grid Systems & Auto-Layouts",
        description: "Learn how to build elastic cards, navigation rails, and scalable multi-device component blueprints.",
        videoUrl: "https://www.youtube.com/embed/c9Wg6Rq_zIA",
        duration: "50 mins",
        quiz: {
          questions: [
            {
              id: "c8-m1-q1",
              question: "What is Figma's Auto-Layout feature principally used to organize?",
              options: ["Dynamic responsive sizing of components based on their content", "The color paletting generator", "External rasterization vectors", "SVG animation paths"],
              answerIndex: 0,
              explanation: "Auto-Layout applies standard flexbox rules, enabling cards or UI objects to automatically resize contextually."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-9",
    title: "SQL & Relational Database Design with PostgreSQL",
    description: "Design relational models, organize relational schemas, write aggregate queries, and manage transactional logic.",
    category: "Tech",
    level: "Intermediate",
    duration: "10 hours",
    rating: 4.8,
    instructor: "Grace Hopper",
    thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c9-m1",
        title: "Database Normalization and Joins",
        description: "Structure data collections up to Third Normal Form (3NF) to avoid data redundancy and update anomalies.",
        videoUrl: "https://www.youtube.com/embed/HXV3zeQKqGY",
        duration: "55 mins",
        quiz: {
          questions: [
            {
              id: "c9-m1-q1",
              question: "What JOIN operator is used to retrieve only matching records present across both linked tables?",
              options: ["LEFT JOIN", "FULL OUTER JOIN", "INNER JOIN", "CROSS JOIN"],
              answerIndex: 2,
              explanation: "INNER JOIN selects only rows that have matching values in both related schemas."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-10",
    title: "Building Scalable REST & GraphQL APIs",
    description: "Develop, secure, and document API layers with modern Node, Express, and Apollo Server schemas.",
    category: "Tech",
    level: "Intermediate",
    duration: "8 hours",
    rating: 4.7,
    instructor: "Marc Andreessen",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c10-m1",
        title: "RESTful Routing Best Practices",
        description: "Establish semantic URI endpoints, correct HTTP status codes, and query state structures.",
        videoUrl: "https://www.youtube.com/embed/7YcW25PHnAA",
        duration: "45 mins",
        quiz: {
          questions: [
            {
              id: "c10-m1-q1",
              question: "Which HTTP method is specifically reserved for applying partial modifications to a resource?",
              options: ["POST", "PUT", "PATCH", "GET"],
              answerIndex: 2,
              explanation: "PATCH is designated for making partial, non-idempotent updates to a target entity resource."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-11",
    title: "Product Management Essentials",
    description: "Formulate product visions, define roadmaps, write high-quality user stories, and master Scrum cycles.",
    category: "Business",
    level: "Beginner",
    duration: "6 hours",
    rating: 4.5,
    instructor: "Product School Team",
    thumbnailUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c11-m1",
        title: "The Product Development Life Cycle",
        description: "Track user discovery stages, market verification tests, prototype releases, and feature deprecation plans.",
        videoUrl: "https://www.youtube.com/embed/XmscvH_T_xM",
        duration: "45 mins",
        quiz: {
          questions: [
            {
              id: "c11-m1-q1",
              question: "What represents a validated Minimal Viable Product (MVP)?",
              options: ["The absolute cheapest implementation possible", "A product with enough basic features to attract early adopters and test assumptions", "A fully designed and completed system with zero bugs", "A wireframe pitch slide-deck"],
              answerIndex: 1,
              explanation: "An MVP evaluates fundamental market viability with minimal physical production resources as early as possible."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-12",
    title: "Cybersecurity and Ethical Hacking Bootcamp",
    description: "Understand penetration profiling, security vulnerabilities, cross-site scripting (XSS), and cryptographic protocols.",
    category: "Tech",
    level: "Advanced",
    duration: "15 hours",
    rating: 4.9,
    instructor: "Kevin Mitnick",
    thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c12-m1",
        title: "Web App Security & OWASP Top 10",
        description: "Analyze classic threat vectors including injection mechanisms, authentication failures, and insecure data exposures.",
        videoUrl: "https://www.youtube.com/embed/fNzpcB7OD3g",
        duration: "1 hour",
        quiz: {
          questions: [
            {
              id: "c12-m1-q1",
              question: "Which technique is majorly effective in preventing SQL Injection vulnerabilities in database servers?",
              options: ["Encrypting log files", "Using parameterized queries or prepared statements", "Setting higher database connection ports", "Hashing users' active displays"],
              answerIndex: 1,
              explanation: "Parameterized queries ensure the SQL compiler handles user input strictly as parameters, never as executable code commands."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-13",
    title: "Cloud Architecture on Google Cloud Platform",
    description: "Build robust, highly scalable software infrastructure using Google Compute Engine, Cloud Run, and GKE cluster management.",
    category: "Tech",
    level: "Intermediate",
    duration: "12 hours",
    rating: 4.8,
    instructor: "Sundar Pichai",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c13-m1",
        title: "Serverless Container Ingress with Cloud Run",
        description: "Deploy serverless stateless containers that scale down to absolute zero in idle periods.",
        videoUrl: "https://www.youtube.com/embed/4gN_uLArC8Y",
        duration: "55 mins",
        quiz: {
          questions: [
            {
              id: "c13-m1-q1",
              question: "What does scale-to-zero imply on Google Cloud Run?",
              options: ["Memory resets to 0 bytes", "Database indices dissolve", "Billing stops entirely during periods of zero request traffic", "Network speed limits"],
              answerIndex: 2,
              explanation: "Container instances are suspended when there is no incoming traffic, eliminating billing costs during idle periods."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-14",
    title: "Introduction to Machine Learning",
    description: "Grasp fundamental regression, decision trees, random forests, and multi-variable classifiers with physical examples.",
    category: "AI",
    level: "Intermediate",
    duration: "10 hours",
    rating: 4.8,
    instructor: "Andrew Ng",
    thumbnailUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c14-m1",
        title: "Supervised versus Unsupervised Learning",
        description: "Classify label models, regression formulas, cluster divisions, and dimensionality conversions.",
        videoUrl: "https://www.youtube.com/embed/GwIo3gToTLA",
        duration: "45 mins",
        quiz: {
          questions: [
            {
              id: "c14-m1-q1",
              question: "What characterizes supervised learning when training model pipelines?",
              options: ["No input features are provided", "A ground truth target label is provided for each training example", "There is no descent optimizing algorithm", "We exclusively use neural graphs"],
              answerIndex: 1,
              explanation: "Supervised learning uses pre-labeled samples to teach the computational system correct output mapping rules."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-15",
    title: "Financial Analysis & Venture Capital",
    description: "Analyze cash budgets, value corporate balance sheets, master capital asset pricing, and negotiate funding terms.",
    category: "Business",
    level: "Advanced",
    duration: "9 hours",
    rating: 4.7,
    instructor: "Warren Buffett",
    thumbnailUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c15-m1",
        title: "Discounted Cash Flow (DCF) Formulations",
        description: "Map future cash inflows back to absolute present value terms using a risk-adjusted cost of capital.",
        videoUrl: "https://www.youtube.com/embed/WEd9zK8_JDo",
        duration: "50 mins",
        quiz: {
          questions: [
            {
              id: "c15-m1-q1",
              question: "What represents the Discount Rate in standard corporate valuation methodologies?",
              options: ["The percentage sales price reduction during promotions", "The hurdle rate or cost of capital adjusted for risk profiles", "The inflation rate exclusively", "The core interbank lending premium"],
              answerIndex: 1,
              explanation: "The discount rate applies a hurdle rate scaling representing risk-adjusted opportunity costs of investor funds over time."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-16",
    title: "Copywriting Secrets for Conversion",
    description: "Structure persuasive writing frameworks to capture reader attention and improve product conversions.",
    category: "Marketing",
    level: "Intermediate",
    duration: "6 hours",
    rating: 4.6,
    instructor: "Robert Cialdini",
    thumbnailUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c16-m1",
        title: "The AIDA Persuasion Structure",
        description: "Apply Attention, Interest, Desire, and Action components in public marketing campaigns.",
        videoUrl: "https://www.youtube.com/embed/T6Z39O6t8xY",
        duration: "35 mins",
        quiz: {
          questions: [
            {
              id: "c16-m1-q1",
              question: "What does the first 'A' in the classic marketing copy acronym AIDA signify?",
              options: ["Automated", "Attention", "Agile", "Audit"],
              answerIndex: 1,
              explanation: "AIDA represents Attention, Interest, Desire, Action. Capture the prospective client's Attention immediately."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-17",
    title: "Docker & Kubernetes Handbook",
    description: "Containerize multi-container architectures, manage volume mounts, and coordinate pod deployments on Kubernetes.",
    category: "Tech",
    level: "Intermediate",
    duration: "13 hours",
    rating: 4.8,
    instructor: "Linus Torvalds",
    thumbnailUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c17-m1",
        title: "Dockerizing an Express and React App",
        description: "Write custom multi-stage Dockerfiles that lock dependencies, cache layers, and optimize image size.",
        videoUrl: "https://www.youtube.com/embed/RqTEHSUpY5g",
        duration: "55 mins",
        quiz: {
          questions: [
            {
              id: "c17-m1-q1",
              question: "What does a multi-stage build accomplish inside Docker?",
              options: [
                "It enables parallel container runs",
                "It splits production dependencies and build-time assets, minimizing final production image size",
                "It automatically deploys containers to multiple cloud servers",
                "It bypasses security authorization checks"
              ],
              answerIndex: 1,
              explanation: "Multi-stage builds permit developers to compile code in builder environments and drop intermediate components from the final production images."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-18",
    title: "Mobile App Development with Flutter",
    description: "Write once, run anywhere. Craft high-performance native iOS and Android apps using the Dart language.",
    category: "Tech",
    level: "Intermediate",
    duration: "11 hours",
    rating: 4.8,
    instructor: "Google Developers",
    thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c18-m1",
        title: "Understanding Widgets: Stateless vs Stateful",
        description: "Learn how the element tree, widget tree, and state configurations operate in high-performance rendering pipelines.",
        videoUrl: "https://www.youtube.com/embed/VPvVD8t02U8",
        duration: "45 mins",
        quiz: {
          questions: [
            {
              id: "c18-m1-q1",
              question: "Which tree in Flutter's architecture represents the physical instantiated node layout on screen?",
              options: ["The Widget Tree", "The State Tree", "The Element Tree", "The Render Tree"],
              answerIndex: 2,
              explanation: "Flutter reconciles a lightweight Widget Tree with an Element Tree, which maps components to long-lived physical layout objects."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-19",
    title: "Agile & Scrum Team Leadership",
    description: "Optimize sprints, manage product backlogs, lead retrospective reviews, and unblock cross-functional team pipelines.",
    category: "Business",
    level: "Beginner",
    duration: "5 hours",
    rating: 4.6,
    instructor: "Ken Schwaber",
    thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c19-m1",
        title: "Agile Principles & Daily Standups",
        description: "Understanding the Agile Manifesto's values and establishing high-cohesion daily interaction rhythms.",
        videoUrl: "https://www.youtube.com/embed/Oox2bN9V1zM",
        duration: "40 mins",
        quiz: {
          questions: [
            {
              id: "c19-m1-q1",
              question: "What is the primary agenda of a standard Agile Daily Standup?",
              options: ["Conduct deep-dive system debugging", "Demonstrate raw code features to stakeholders", "Answer: What did I complete, what am I working on, and are there any speed blockers?", "Critique code styling files"],
              answerIndex: 2,
              explanation: "Daily standups aim to maintain alignment on immediate tactical tasks and identify operational blocks within 15 minutes."
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-20",
    title: "AI-Powered Software Development with Gemini",
    description: "Supercharge your coding workflows by learning advanced system integrations and leveraging Google's GenAI SDKs.",
    category: "AI",
    level: "Intermediate",
    duration: "8 hours",
    rating: 4.9,
    instructor: "Demis Hassabis",
    thumbnailUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop",
    modules: [
      {
        id: "c20-m1",
        title: "Calling the Google GenAI SDK Series",
        description: "Integrate the official `@google/genai` library in full-stack Node.js and client environments securely.",
        videoUrl: "https://www.youtube.com/embed/zS6gRorXq_4",
        duration: "45 mins",
        quiz: {
          questions: [
            {
              id: "c20-m1-q1",
              question: "What is the premium, secure place to keep API secrets like GEMINI_API_KEY in full-stack apps?",
              options: ["Directly inside frontend client React component files", "In an environment configuration set on a server proxy layer", "In public git repositories", "In browser cookie headers"],
              answerIndex: 1,
              explanation: "All secret API keys must live behind secure server environments (e.g. process.env on Node.js) to avoid exposing them."
            }
          ]
        }
      }
    ]
  }
];
