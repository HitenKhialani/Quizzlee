import { Subject, Lesson, Question, SubjectType } from '../types/quiz';

export const subjects: Subject[] = [
  {
    id: 'data-analytics',
    name: 'Data Analytics',
    description: 'Master data analysis, visualization, and statistical methods',
    icon: '📊',
    color: 'data-analytics',
    gradient: 'gradient-data',
    totalQuestions: 300,
    lessons: [
      {
        id: 'da-1',
        title: 'Introduction to Data Analytics',
        content: 'Data analytics is the process of analyzing datasets to draw conclusions about the information they contain. It involves applying statistical and computational techniques to extract insights from data.',
        subject: 'data-analytics',
        order: 1,
        estimatedTime: 25
      },
      {
        id: 'da-2',
        title: 'Data Collection Methods',
        content: 'Learn various methods of data collection including surveys, experiments, observations, and secondary data sources. Understanding proper data collection is crucial for reliable analysis.',
        subject: 'data-analytics',
        order: 2,
        estimatedTime: 30
      },
      {
        id: 'da-3',
        title: 'Data Cleaning and Preprocessing',
        content: 'Data cleaning involves identifying and correcting errors, handling missing values, and transforming data into a suitable format for analysis. This step is critical for accurate results.',
        subject: 'data-analytics',
        order: 3,
        estimatedTime: 35
      },
      {
        id: 'da-4',
        title: 'Statistical Analysis',
        content: 'Statistical analysis involves descriptive statistics, probability distributions, hypothesis testing, and regression analysis to understand patterns and relationships in data.',
        subject: 'data-analytics',
        order: 4,
        estimatedTime: 40
      },
      {
        id: 'da-5',
        title: 'Data Visualization',
        content: 'Data visualization is the graphical representation of data using charts, graphs, and interactive dashboards to communicate insights effectively to stakeholders.',
        subject: 'data-analytics',
        order: 5,
        estimatedTime: 30
      }
    ]
  },
  {
    id: 'operating-systems',
    name: 'Operating Systems',
    description: 'Understand OS concepts, processes, memory management, and system calls',
    icon: '💻',
    color: 'operating-systems',
    gradient: 'gradient-os',
    totalQuestions: 300,
    lessons: [
      {
        id: 'os-1',
        title: 'Introduction to Operating Systems',
        content: 'An operating system is system software that manages computer hardware and provides services for computer programs. It acts as an intermediary between users and hardware.',
        subject: 'operating-systems',
        order: 1,
        estimatedTime: 30
      },
      {
        id: 'os-2',
        title: 'Process Management',
        content: 'Process management involves creating, scheduling, and terminating processes. Learn about process states, context switching, and inter-process communication.',
        subject: 'operating-systems',
        order: 2,
        estimatedTime: 35
      },
      {
        id: 'os-3',
        title: 'Memory Management',
        content: 'Memory management handles the allocation and deallocation of memory space. Topics include virtual memory, paging, segmentation, and memory protection.',
        subject: 'operating-systems',
        order: 3,
        estimatedTime: 40
      },
      {
        id: 'os-4',
        title: 'File Systems',
        content: 'File systems organize and store data on storage devices. Learn about file allocation methods, directory structures, and file access methods.',
        subject: 'operating-systems',
        order: 4,
        estimatedTime: 35
      },
      {
        id: 'os-5',
        title: 'System Security',
        content: 'System security involves protecting the OS and its resources from unauthorized access, malware, and security threats through various mechanisms.',
        subject: 'operating-systems',
        order: 5,
        estimatedTime: 30
      }
    ]
  },
  {
    id: 'entrepreneurship',
    name: 'Entrepreneurship',
    description: 'Learn business planning, innovation, and startup fundamentals',
    icon: '💡',
    color: 'entrepreneurship',
    gradient: 'gradient-entrepreneur',
    totalQuestions: 300,
    lessons: [
      {
        id: 'ent-1',
        title: 'Introduction to Entrepreneurship',
        content: 'Entrepreneurship is the process of creating, developing, and managing a business venture to make a profit. It involves innovation, risk-taking, and opportunity recognition.',
        subject: 'entrepreneurship',
        order: 1,
        estimatedTime: 25
      },
      {
        id: 'ent-2',
        title: 'Business Planning',
        content: 'Business planning involves creating a comprehensive roadmap for your business, including market analysis, financial projections, and strategic objectives.',
        subject: 'entrepreneurship',
        order: 2,
        estimatedTime: 40
      },
      {
        id: 'ent-3',
        title: 'Market Research and Analysis',
        content: 'Market research helps entrepreneurs understand their target market, competition, and industry trends to make informed business decisions.',
        subject: 'entrepreneurship',
        order: 3,
        estimatedTime: 35
      },
      {
        id: 'ent-4',
        title: 'Finance and Funding',
        content: 'Learn about different sources of funding, financial planning, cash flow management, and investor relations for startups and small businesses.',
        subject: 'entrepreneurship',
        order: 4,
        estimatedTime: 45
      },
      {
        id: 'ent-5',
        title: 'Marketing and Sales',
        content: 'Effective marketing and sales strategies are crucial for business success. Learn about digital marketing, customer acquisition, and sales techniques.',
        subject: 'entrepreneurship',
        order: 5,
        estimatedTime: 35
      }
    ]
  },
  {
    id: 'software-engineering',
    name: 'Software Engineering',
    description: 'Master software development lifecycle, design patterns, and best practices',
    icon: '📘',
    color: 'software-engineering',
    gradient: 'gradient-software',
    totalQuestions: 300,
    lessons: [
      {
        id: 'se-1',
        title: 'Introduction to Software Engineering',
        content: 'Software engineering is the systematic application of engineering principles to software development. It involves planning, designing, building, and maintaining software systems.',
        subject: 'software-engineering',
        order: 1,
        estimatedTime: 30
      },
      {
        id: 'se-2',
        title: 'Software Development Lifecycle',
        content: 'The SDLC is a structured process for developing software applications. Learn about different methodologies like Waterfall, Agile, and DevOps.',
        subject: 'software-engineering',
        order: 2,
        estimatedTime: 35
      },
      {
        id: 'se-3',
        title: 'Requirements Engineering',
        content: 'Requirements engineering involves gathering, analyzing, and documenting software requirements. It ensures the final product meets user needs.',
        subject: 'software-engineering',
        order: 3,
        estimatedTime: 40
      },
      {
        id: 'se-4',
        title: 'Software Design and Architecture',
        content: 'Software design involves creating the structure and behavior of software systems. Learn about design patterns, architectural styles, and system design.',
        subject: 'software-engineering',
        order: 4,
        estimatedTime: 45
      },
      {
        id: 'se-5',
        title: 'Testing and Quality Assurance',
        content: 'Software testing ensures that applications work correctly and meet quality standards. Learn about testing methodologies, tools, and best practices.',
        subject: 'software-engineering',
        order: 5,
        estimatedTime: 35
      }
    ]
  }
];

export const getSubjectById = (id: string): Subject | undefined => {
  return subjects.find(subject => subject.id === id);
};

export const getLessonById = (lessonId: string): Lesson | undefined => {
  for (const subject of subjects) {
    const lesson = subject.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
};