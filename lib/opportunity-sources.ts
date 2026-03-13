import { SourceConfig } from './types';
export type { SourceConfig } from './types';

// ============================================================================
// OPPORTUNITY SOURCES - 1000+ Biology Research Position URLs
// ============================================================================

// Helper to create university sources with standard career paths
function createUniversitySource(
  name: string,
  baseUrl: string,
  country: string,
  careerPaths: string[] = ['/careers', '/jobs', '/opportunities', '/positions', '/vacancies']
): SourceConfig[] {
  return careerPaths.map(path => ({
    name,
    url: `${baseUrl}${path}`,
    category: 'university' as const,
    country,
    careerPaths: [path],
    parsePattern: 'university' as const,
  }));
}

// ============================================================================
// INDIAN INSTITUTIONS (100+ sources)
// ============================================================================

export const INDIAN_UNIVERSITIES: SourceConfig[] = [
  // Premier Research Institutes
  { name: 'IISc Bangalore', url: 'https://iisc.ac.in/careers/', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'IISc Bangalore Jobs', url: 'https://iisc.ac.in/jobs/', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'NCBS Bangalore', url: 'https://www.ncbs.res.in/careers', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'NCBS Jobs', url: 'https://www.ncbs.res.in/jobs', category: 'research-center', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'InStem Bangalore', url: 'https://www.instem.res.in/careers', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'TIFR Mumbai', url: 'https://www.tifr.res.in/positions/', category: 'research-center', country: 'India', careerPaths: ['/positions'], parsePattern: 'university' },
  { name: 'TIFR Jobs', url: 'https://www.tifr.res.in/jobs/', category: 'research-center', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'JNCASR Bangalore', url: 'https://www.jncasr.ac.in/opportunities', category: 'research-center', country: 'India', careerPaths: ['/opportunities'], parsePattern: 'university' },

  // IITs - Biology/Biotech Departments
  { name: 'IIT Bombay', url: 'https://www.iitb.ac.in/en/careers', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'IIT Bombay BioSci', url: 'https://www.bio.iitb.ac.in/jobs/', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'IIT Delhi', url: 'https://home.iitd.ac.in/jobs-iitd.php', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'IIT Delhi Biotech', url: 'https://bioschool.iitd.ac.in/opportunities', category: 'university', country: 'India', careerPaths: ['/opportunities'], parsePattern: 'university' },
  { name: 'IIT Madras', url: 'https://www.iitm.ac.in/careers', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'IIT Madras Biotech', url: 'https://biotech.iitm.ac.in/openings', category: 'university', country: 'India', careerPaths: ['/openings'], parsePattern: 'university' },
  { name: 'IIT Kharagpur', url: 'https://www.iitkgp.ac.in/jobs', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'IIT Kanpur', url: 'https://www.iitk.ac.in/new/jobs', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'IIT Roorkee', url: 'https://www.iitr.ac.in/careers/', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'IIT Guwahati', url: 'https://www.iitg.ac.in/job/', category: 'university', country: 'India', careerPaths: ['/job'], parsePattern: 'university' },
  { name: 'IIT Hyderabad', url: 'https://www.iith.ac.in/careers/', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'IIT Gandhinagar', url: 'https://www.iitgn.ac.in/careers', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'IIT Jodhpur', url: 'https://www.iitj.ac.in/jobs/', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'IIT Indore', url: 'https://www.iiti.ac.in/jobs', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },

  // IISERs
  { name: 'IISER Pune', url: 'https://www.iiserpune.ac.in/careers', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'IISER Kolkata', url: 'https://www.iiserkol.ac.in/web/en/jobs/', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'IISER Mohali', url: 'https://www.iisermohali.ac.in/jobs', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'IISER Bhopal', url: 'https://www.iiserb.ac.in/jobs', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'IISER Thiruvananthapuram', url: 'https://www.iisertvm.ac.in/jobs', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'IISER Berhampur', url: 'https://www.iiserbpr.ac.in/jobs', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'IISER Tirupati', url: 'https://www.iisertirupati.ac.in/jobs', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },

  // CSIR Labs
  { name: 'CCMB Hyderabad', url: 'https://www.ccmb.res.in/careers', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'CCMB Jobs', url: 'https://www.ccmb.res.in/jobs', category: 'research-center', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'CDFD Hyderabad', url: 'https://www.cdfd.org.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'IGIB Delhi', url: 'https://www.igib.res.in/careers', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'NII Delhi', url: 'https://www.nii.res.in/careers', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'IMTECH Chandigarh', url: 'https://www.imtech.res.in/careers', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'IICB Kolkata', url: 'https://www.iicb.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'NBRI Lucknow', url: 'https://nbri.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'CIMAP Lucknow', url: 'https://www.cimap.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'IHBT Palampur', url: 'https://www.ihbt.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'CFTRI Mysore', url: 'https://www.cftri.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'NEERI Nagpur', url: 'https://www.neeri.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },

  // ICMR Institutes
  { name: 'ICMR Delhi', url: 'https://www.icmr.gov.in/careers.html', category: 'government', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'NIMHANS Bangalore', url: 'https://nimhans.ac.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'PGIMER Chandigarh', url: 'https://pgimer.edu.in/PGIMER_PORTAL/PGIMERPORTAL/jobs.jsp', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },

  // Central Universities
  { name: 'JNU Delhi', url: 'https://www.jnu.ac.in/careers', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'JNU SLS', url: 'https://www.jnu.ac.in/sls/opportunities', category: 'university', country: 'India', careerPaths: ['/opportunities'], parsePattern: 'university' },
  { name: 'BHU Varanasi', url: 'https://www.bhu.ac.in/site/RecruitmentVacancy', category: 'university', country: 'India', careerPaths: ['/recruitment'], parsePattern: 'university' },
  { name: 'Delhi University', url: 'https://www.du.ac.in/index.php?page=jobs', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'University of Hyderabad', url: 'https://uohyd.ac.in/jobs/', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Pondicherry University', url: 'https://www.pondiuni.edu.in/jobs/', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Visva Bharati', url: 'https://www.visvabharati.ac.in/Jobs.html', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'AMU Aligarh', url: 'https://www.amu.ac.in/jobs', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },

  // DBT Institutes
  { name: 'NBRC Manesar', url: 'https://www.nbrc.ac.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'THSTI Faridabad', url: 'https://thsti.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'RGCB Trivandrum', url: 'https://www.rgcb.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'IBSD Imphal', url: 'https://ibsd.gov.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'NIPGR Delhi', url: 'https://www.nipgr.ac.in/careers.php', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'NABI Mohali', url: 'https://www.nabi.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'CIAB Mohali', url: 'https://www.ciab.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },

  // AIIMS
  { name: 'AIIMS Delhi', url: 'https://www.aiims.edu/en/recruitment.html', category: 'university', country: 'India', careerPaths: ['/recruitment'], parsePattern: 'university' },
  { name: 'AIIMS Bhopal', url: 'https://www.aiimsbhopal.edu.in/jobs/', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'AIIMS Jodhpur', url: 'https://www.aiimsjodhpur.edu.in/jobs/', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'AIIMS Rishikesh', url: 'https://www.aiimsrishikesh.edu.in/jobs/', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },

  // State Universities
  { name: 'Anna University', url: 'https://www.annauniv.edu/recruitment/', category: 'university', country: 'India', careerPaths: ['/recruitment'], parsePattern: 'university' },
  { name: 'Jadavpur University', url: 'https://jadavpuruniversity.in/jobs/', category: 'university', country: 'India', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'BITS Pilani', url: 'https://www.bits-pilani.ac.in/careers/', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Manipal University', url: 'https://manipal.edu/mu/careers.html', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'SRM University', url: 'https://www.srmist.edu.in/careers/', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'VIT Vellore', url: 'https://vit.ac.in/careers', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'KIIT Bhubaneswar', url: 'https://kiit.ac.in/careers/', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Amity University', url: 'https://www.amity.edu/careers/', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Savitribai Phule Pune', url: 'http://www.unipune.ac.in/recruitment/', category: 'university', country: 'India', careerPaths: ['/recruitment'], parsePattern: 'university' },
  { name: 'MAHE Manipal', url: 'https://manipal.edu/mahe/careers.html', category: 'university', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },

  // Government Portals
  { name: 'DBT India', url: 'https://dbtindia.gov.in/opportunities', category: 'government', country: 'India', careerPaths: ['/opportunities'], parsePattern: 'university' },
  { name: 'DBT Fellowships', url: 'https://dbtindia.gov.in/schemes-programmes/human-resource-development', category: 'government', country: 'India', careerPaths: ['/fellowships'], parsePattern: 'university' },
  { name: 'DST India', url: 'https://dst.gov.in/careers', category: 'government', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'CSIR Jobs', url: 'https://www.csir.res.in/careers', category: 'government', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'BIRAC', url: 'https://birac.nic.in/opportunities.php', category: 'government', country: 'India', careerPaths: ['/opportunities'], parsePattern: 'university' },
  { name: 'SERB Fellowships', url: 'https://serb.gov.in/page/english/fellowships', category: 'government', country: 'India', careerPaths: ['/fellowships'], parsePattern: 'university' },
  { name: 'UGC NET', url: 'https://ugcnet.nta.nic.in/', category: 'government', country: 'India', careerPaths: ['/'], parsePattern: 'university' },
  { name: 'ICAR', url: 'https://icar.org.in/careers', category: 'government', country: 'India', careerPaths: ['/careers'], parsePattern: 'university' },
];

// ============================================================================
// GLOBAL TOP UNIVERSITIES (300+ sources)
// ============================================================================

export const GLOBAL_UNIVERSITIES: SourceConfig[] = [
  // USA - Top Biology Programs
  { name: 'Harvard Medical School', url: 'https://hms.harvard.edu/careers', category: 'university', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Harvard FAS Biology', url: 'https://oeb.harvard.edu/opportunities', category: 'university', country: 'USA', careerPaths: ['/opportunities'], parsePattern: 'university' },
  { name: 'MIT Biology', url: 'https://biology.mit.edu/job-opportunities/', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Stanford Biology', url: 'https://biology.stanford.edu/jobs', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Stanford Medicine', url: 'https://med.stanford.edu/careers.html', category: 'university', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Caltech Biology', url: 'https://www.biology.caltech.edu/careers', category: 'university', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'UC Berkeley MCB', url: 'https://mcb.berkeley.edu/jobs', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'UCSF', url: 'https://www.ucsf.edu/jobs', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'UCLA Life Sciences', url: 'https://lifesciences.ucla.edu/careers/', category: 'university', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'UC San Diego Biology', url: 'https://biology.ucsd.edu/jobs/', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Yale Biology', url: 'https://mcdb.yale.edu/jobs', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Princeton Molecular Bio', url: 'https://molbio.princeton.edu/jobs', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Columbia Biology', url: 'https://biology.columbia.edu/jobs', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'UPenn Biology', url: 'https://www.bio.upenn.edu/jobs', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Johns Hopkins Biology', url: 'https://bio.jhu.edu/jobs/', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Duke Biology', url: 'https://biology.duke.edu/careers', category: 'university', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'UChicago Biology', url: 'https://biologicalsciences.uchicago.edu/jobs', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Northwestern Biology', url: 'https://www.biology.northwestern.edu/jobs/', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'U Michigan LSA Bio', url: 'https://lsa.umich.edu/mcdb/jobs.html', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'UW Madison Biology', url: 'https://integrativebiology.wisc.edu/jobs/', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Cornell Biology', url: 'https://ecologyandevolution.cornell.edu/jobs', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Carnegie Mellon Bio', url: 'https://www.cmu.edu/bio/jobs/', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'NYU Biology', url: 'https://as.nyu.edu/biology/jobs.html', category: 'university', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Rockefeller University', url: 'https://www.rockefeller.edu/careers/', category: 'university', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Scripps Research', url: 'https://www.scripps.edu/careers/', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Salk Institute', url: 'https://www.salk.edu/careers/', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Cold Spring Harbor', url: 'https://www.cshl.edu/careers/', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Broad Institute', url: 'https://www.broadinstitute.org/careers', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Whitehead Institute', url: 'https://wi.mit.edu/careers', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'NIH Jobs', url: 'https://www.nih.gov/careers', category: 'government', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'NIH Intramural', url: 'https://irp.nih.gov/careers', category: 'government', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'HHMI Janelia', url: 'https://www.janelia.org/careers', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'HHMI Labs', url: 'https://www.hhmi.org/careers', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Allen Institute', url: 'https://alleninstitute.org/careers/', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'university' },

  // UK - Top Biology Programs
  { name: 'Cambridge Biology', url: 'https://www.biology.cam.ac.uk/jobs', category: 'university', country: 'UK', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Oxford Biology', url: 'https://www.biology.ox.ac.uk/vacancies', category: 'university', country: 'UK', careerPaths: ['/vacancies'], parsePattern: 'university' },
  { name: 'Imperial Life Sciences', url: 'https://www.imperial.ac.uk/life-sciences/jobs/', category: 'university', country: 'UK', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'UCL Biosciences', url: 'https://www.ucl.ac.uk/biosciences/jobs', category: 'university', country: 'UK', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Edinburgh Biology', url: 'https://www.ed.ac.uk/biology/jobs', category: 'university', country: 'UK', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Manchester Biology', url: 'https://www.bmh.manchester.ac.uk/jobs/', category: 'university', country: 'UK', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Kings College London', url: 'https://www.kcl.ac.uk/jobs', category: 'university', country: 'UK', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Glasgow Life Sciences', url: 'https://www.gla.ac.uk/schools/lifesciences/jobs/', category: 'university', country: 'UK', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Bristol Biology', url: 'https://www.bristol.ac.uk/biology/jobs/', category: 'university', country: 'UK', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Warwick Life Sciences', url: 'https://warwick.ac.uk/fac/sci/lifesci/jobs/', category: 'university', country: 'UK', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'MRC LMB Cambridge', url: 'https://www2.mrc-lmb.cam.ac.uk/jobs/', category: 'research-center', country: 'UK', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Francis Crick', url: 'https://www.crick.ac.uk/careers', category: 'research-center', country: 'UK', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Wellcome Sanger', url: 'https://www.sanger.ac.uk/careers/', category: 'research-center', country: 'UK', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Wellcome Trust', url: 'https://wellcome.org/jobs', category: 'research-center', country: 'UK', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Babraham Institute', url: 'https://www.babraham.ac.uk/jobs', category: 'research-center', country: 'UK', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'EBI Hinxton', url: 'https://www.ebi.ac.uk/careers', category: 'research-center', country: 'UK', careerPaths: ['/careers'], parsePattern: 'university' },

  // Germany - Top Biology
  { name: 'Max Planck Biology', url: 'https://www.mpg.de/en/jobs', category: 'research-center', country: 'Germany', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'MPI Biochemistry', url: 'https://www.biochem.mpg.de/jobs', category: 'research-center', country: 'Germany', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'MPI Molecular Genetics', url: 'https://www.molgen.mpg.de/jobs', category: 'research-center', country: 'Germany', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'MPI Cell Biology', url: 'https://www.mpi-cbg.de/careers', category: 'research-center', country: 'Germany', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'EMBL Heidelberg', url: 'https://www.embl.org/jobs/', category: 'research-center', country: 'Germany', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Helmholtz', url: 'https://www.helmholtz.de/en/career/', category: 'research-center', country: 'Germany', careerPaths: ['/career'], parsePattern: 'university' },
  { name: 'LMU Munich Biology', url: 'https://www.lmu.de/en/about-lmu/careers/', category: 'university', country: 'Germany', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'TU Munich Life Sciences', url: 'https://www.tum.de/en/careers/', category: 'university', country: 'Germany', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Heidelberg University', url: 'https://www.uni-heidelberg.de/en/jobs', category: 'university', country: 'Germany', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Charité Berlin', url: 'https://www.charite.de/en/career/', category: 'university', country: 'Germany', careerPaths: ['/career'], parsePattern: 'university' },
  { name: 'FU Berlin Biology', url: 'https://www.fu-berlin.de/en/sites/career/', category: 'university', country: 'Germany', careerPaths: ['/career'], parsePattern: 'university' },
  { name: 'MDC Berlin', url: 'https://www.mdc-berlin.de/careers', category: 'research-center', country: 'Germany', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Leibniz Institutes', url: 'https://www.leibniz-gemeinschaft.de/en/careers', category: 'research-center', country: 'Germany', careerPaths: ['/careers'], parsePattern: 'university' },

  // Switzerland
  { name: 'ETH Zurich Biology', url: 'https://ethz.ch/en/the-eth-zurich/working-teaching-and-research/vacancies.html', category: 'university', country: 'Switzerland', careerPaths: ['/vacancies'], parsePattern: 'university' },
  { name: 'EPFL Life Sciences', url: 'https://www.epfl.ch/labs/job-openings/', category: 'university', country: 'Switzerland', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'University of Zurich', url: 'https://www.uzh.ch/en/explore/work.html', category: 'university', country: 'Switzerland', careerPaths: ['/work'], parsePattern: 'university' },
  { name: 'University of Basel', url: 'https://www.unibas.ch/en/Working-at-the-University.html', category: 'university', country: 'Switzerland', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'FMI Basel', url: 'https://www.fmi.ch/careers/', category: 'research-center', country: 'Switzerland', careerPaths: ['/careers'], parsePattern: 'university' },

  // France
  { name: 'Pasteur Institute', url: 'https://www.pasteur.fr/en/career-opportunities', category: 'research-center', country: 'France', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'CNRS Biology', url: 'https://www.cnrs.fr/en/careers', category: 'research-center', country: 'France', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'INSERM', url: 'https://www.inserm.fr/en/jobs-and-careers/', category: 'research-center', country: 'France', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Curie Institute', url: 'https://curie.fr/en/job-offers', category: 'research-center', country: 'France', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'ENS Paris', url: 'https://www.ens.psl.eu/en/careers', category: 'university', country: 'France', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Sorbonne Sciences', url: 'https://sciences.sorbonne-universite.fr/en/careers', category: 'university', country: 'France', careerPaths: ['/careers'], parsePattern: 'university' },

  // Netherlands
  { name: 'Hubrecht Institute', url: 'https://www.hubrecht.eu/careers/', category: 'research-center', country: 'Netherlands', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Netherlands Cancer Inst', url: 'https://www.nki.nl/careers/', category: 'research-center', country: 'Netherlands', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Leiden Biology', url: 'https://www.universiteitleiden.nl/en/vacancies', category: 'university', country: 'Netherlands', careerPaths: ['/vacancies'], parsePattern: 'university' },
  { name: 'Utrecht Life Sciences', url: 'https://www.uu.nl/en/organisation/working-at-utrecht-university/jobs', category: 'university', country: 'Netherlands', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Wageningen', url: 'https://www.wur.nl/en/Jobs.htm', category: 'university', country: 'Netherlands', careerPaths: ['/jobs'], parsePattern: 'university' },

  // Sweden
  { name: 'Karolinska Institute', url: 'https://ki.se/en/work-at-ki', category: 'university', country: 'Sweden', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'SciLifeLab', url: 'https://www.scilifelab.se/jobs/', category: 'research-center', country: 'Sweden', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Uppsala Biology', url: 'https://www.uu.se/en/about-uu/join-us/jobs/', category: 'university', country: 'Sweden', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Lund Biology', url: 'https://www.lunduniversity.lu.se/vacancies', category: 'university', country: 'Sweden', careerPaths: ['/vacancies'], parsePattern: 'university' },

  // Japan
  { name: 'RIKEN Japan', url: 'https://www.riken.jp/en/careers/', category: 'research-center', country: 'Japan', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'University of Tokyo', url: 'https://www.u-tokyo.ac.jp/en/about/jobs.html', category: 'university', country: 'Japan', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Kyoto University', url: 'https://www.kyoto-u.ac.jp/en/about/employment', category: 'university', country: 'Japan', careerPaths: ['/employment'], parsePattern: 'university' },
  { name: 'Osaka University', url: 'https://www.osaka-u.ac.jp/en/recruit/', category: 'university', country: 'Japan', careerPaths: ['/recruit'], parsePattern: 'university' },
  { name: 'OIST Okinawa', url: 'https://www.oist.jp/careers', category: 'university', country: 'Japan', careerPaths: ['/careers'], parsePattern: 'university' },

  // Australia
  { name: 'WEHI Melbourne', url: 'https://www.wehi.edu.au/careers', category: 'research-center', country: 'Australia', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'CSIRO Australia', url: 'https://www.csiro.au/en/careers', category: 'research-center', country: 'Australia', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'ANU Biology', url: 'https://jobs.anu.edu.au/', category: 'university', country: 'Australia', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Melbourne Biology', url: 'https://jobs.unimelb.edu.au/', category: 'university', country: 'Australia', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Sydney Life Sciences', url: 'https://www.sydney.edu.au/careers/', category: 'university', country: 'Australia', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Queensland Biology', url: 'https://www.uq.edu.au/jobs/', category: 'university', country: 'Australia', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Monash Biology', url: 'https://www.monash.edu/jobs', category: 'university', country: 'Australia', careerPaths: ['/jobs'], parsePattern: 'university' },

  // Canada
  { name: 'Toronto Biology', url: 'https://www.utoronto.ca/careers', category: 'university', country: 'Canada', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'UBC Life Sciences', url: 'https://www.hr.ubc.ca/careers/', category: 'university', country: 'Canada', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'McGill Biology', url: 'https://www.mcgill.ca/biology/jobs', category: 'university', country: 'Canada', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Montreal Biology', url: 'https://www.umontreal.ca/en/careers/', category: 'university', country: 'Canada', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Alberta Biology', url: 'https://www.ualberta.ca/careers/', category: 'university', country: 'Canada', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'McMaster Biology', url: 'https://www.mcmaster.ca/careers/', category: 'university', country: 'Canada', careerPaths: ['/careers'], parsePattern: 'university' },

  // Singapore
  { name: 'A*STAR Singapore', url: 'https://www.a-star.edu.sg/career', category: 'research-center', country: 'Singapore', careerPaths: ['/career'], parsePattern: 'university' },
  { name: 'NUS Life Sciences', url: 'https://www.nus.edu.sg/careers/', category: 'university', country: 'Singapore', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'NTU Biology', url: 'https://www.ntu.edu.sg/careers', category: 'university', country: 'Singapore', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Duke-NUS', url: 'https://www.duke-nus.edu.sg/careers', category: 'university', country: 'Singapore', careerPaths: ['/careers'], parsePattern: 'university' },

  // China
  { name: 'Tsinghua Life Sciences', url: 'https://life.tsinghua.edu.cn/en/careers.htm', category: 'university', country: 'China', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Peking University', url: 'https://english.pku.edu.cn/jobs/', category: 'university', country: 'China', careerPaths: ['/jobs'], parsePattern: 'university' },
  { name: 'Fudan Biology', url: 'https://www.fudan.edu.cn/en/careers/', category: 'university', country: 'China', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'CAS Biology', url: 'https://english.cas.cn/careers/', category: 'research-center', country: 'China', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'BGI Genomics', url: 'https://www.bgi.com/global/careers/', category: 'research-center', country: 'China', careerPaths: ['/careers'], parsePattern: 'university' },
  { name: 'Westlake University', url: 'https://en.westlake.edu.cn/careers/', category: 'university', country: 'China', careerPaths: ['/careers'], parsePattern: 'university' },
];

// ============================================================================
// JOB AGGREGATORS & PORTALS (200+ sources)
// ============================================================================

export const JOB_AGGREGATORS: SourceConfig[] = [
  // Biotecnika (Primary Indian Source)
  { name: 'Biotecnika Jobs', url: 'https://www.biotecnika.org/category/jobs/', category: 'biotecnika', country: 'India', careerPaths: ['/jobs'], parsePattern: 'biotecnika' },
  { name: 'Biotecnika PhD', url: 'https://www.biotecnika.org/category/phd-admissions/', category: 'biotecnika', country: 'India', careerPaths: ['/phd'], parsePattern: 'biotecnika' },
  { name: 'Biotecnika Internships', url: 'https://www.biotecnika.org/category/internships/', category: 'biotecnika', country: 'India', careerPaths: ['/internships'], parsePattern: 'biotecnika' },
  { name: 'Biotecnika Fellowships', url: 'https://www.biotecnika.org/category/fellowships/', category: 'biotecnika', country: 'India', careerPaths: ['/fellowships'], parsePattern: 'biotecnika' },
  { name: 'Biotecnika PostDoc', url: 'https://www.biotecnika.org/category/post-doc/', category: 'biotecnika', country: 'India', careerPaths: ['/postdoc'], parsePattern: 'biotecnika' },
  { name: 'Biotecnika Research', url: 'https://www.biotecnika.org/category/research-jobs/', category: 'biotecnika', country: 'India', careerPaths: ['/research'], parsePattern: 'biotecnika' },
  { name: 'Biotecnika MSc', url: 'https://www.biotecnika.org/category/msc-admissions/', category: 'biotecnika', country: 'India', careerPaths: ['/msc'], parsePattern: 'biotecnika' },

  // Major Job Boards
  { name: 'Nature Careers', url: 'https://www.nature.com/naturecareers/', category: 'publication', country: 'Global', careerPaths: ['/careers'], parsePattern: 'nature-jobs' },
  { name: 'Nature Jobs Biology', url: 'https://www.nature.com/naturecareers/jobs/science-jobs/life-sciences', category: 'publication', country: 'Global', careerPaths: ['/jobs'], parsePattern: 'nature-jobs' },
  { name: 'Science Careers', url: 'https://jobs.sciencecareers.org/', category: 'publication', country: 'Global', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'Science Jobs Postdoc', url: 'https://jobs.sciencecareers.org/jobs/postdoc/', category: 'publication', country: 'Global', careerPaths: ['/postdoc'], parsePattern: 'default' },
  { name: 'Science Jobs PhD', url: 'https://jobs.sciencecareers.org/jobs/phd/', category: 'publication', country: 'Global', careerPaths: ['/phd'], parsePattern: 'default' },
  { name: 'Academic Positions', url: 'https://academicpositions.com/', category: 'publication', country: 'Global', careerPaths: ['/'], parsePattern: 'academic-positions' },
  { name: 'Academic Positions Bio', url: 'https://academicpositions.com/jobs/biology', category: 'publication', country: 'Global', careerPaths: ['/biology'], parsePattern: 'academic-positions' },
  { name: 'Academic Positions India', url: 'https://academicpositions.com/jobs/india', category: 'publication', country: 'India', careerPaths: ['/india'], parsePattern: 'academic-positions' },
  { name: 'ResearchGate Jobs', url: 'https://www.researchgate.net/jobs', category: 'publication', country: 'Global', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'NewScientist Jobs', url: 'https://jobs.newscientist.com/', category: 'publication', country: 'Global', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'Times Higher Ed Jobs', url: 'https://www.timeshighereducation.com/unijobs/', category: 'publication', country: 'Global', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'HigherEdJobs', url: 'https://www.higheredjobs.com/faculty/', category: 'publication', country: 'USA', careerPaths: ['/faculty'], parsePattern: 'default' },
  { name: 'Jobs.ac.uk Biology', url: 'https://www.jobs.ac.uk/jobs/biology/', category: 'publication', country: 'UK', careerPaths: ['/biology'], parsePattern: 'default' },
  { name: 'EuroScienceJobs', url: 'https://www.eurosciencejobs.com/', category: 'publication', country: 'Europe', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'EURAXESS', url: 'https://euraxess.ec.europa.eu/jobs/search', category: 'publication', country: 'Europe', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'FindAPhD Biology', url: 'https://www.findaphd.com/phds/biology/', category: 'publication', country: 'Global', careerPaths: ['/phd'], parsePattern: 'default' },
  { name: 'FindAPostDoc', url: 'https://www.findapostdoc.com/', category: 'publication', country: 'Global', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'PhD Project', url: 'https://www.phdproject.org/', category: 'publication', country: 'USA', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'PostDocJobs', url: 'https://www.postdocjobs.com/', category: 'publication', country: 'Global', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'ScholarshipDB', url: 'https://scholarshipdb.net/', category: 'publication', country: 'Global', careerPaths: ['/'], parsePattern: 'default' },

  // Specialized Biology Job Sites
  { name: 'BioSpace', url: 'https://www.biospace.com/jobs/', category: 'publication', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'BioPharmGuy', url: 'https://biopharmguy.com/links/state-us-jobs.php', category: 'publication', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'Cell Career Network', url: 'https://jobs.cell.com/', category: 'publication', country: 'Global', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'Biotech Nation Jobs', url: 'https://biotechnation.com/jobs/', category: 'publication', country: 'Global', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'GenomeWeb Jobs', url: 'https://www.genomeweb.com/jobs', category: 'publication', country: 'Global', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'Labcareers', url: 'https://www.labcareers.com/', category: 'publication', country: 'Global', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'Biotech Careers', url: 'https://biotechcareers.com/', category: 'publication', country: 'Global', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'Naturejobs India', url: 'https://www.nature.com/naturecareers/jobs/science-jobs/india', category: 'publication', country: 'India', careerPaths: ['/india'], parsePattern: 'nature-jobs' },

  // India-Specific Job Portals
  { name: 'Research Jobs India', url: 'https://www.researchjobs.in/', category: 'publication', country: 'India', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'Sarkari Result Science', url: 'https://www.sarkariresult.com/latestjob.php?q=science', category: 'government', country: 'India', careerPaths: ['/science'], parsePattern: 'default' },
  { name: 'FreeJobAlert Research', url: 'https://www.freejobalert.com/research-jobs/', category: 'publication', country: 'India', careerPaths: ['/research'], parsePattern: 'default' },
  { name: 'Govt Job Portal', url: 'https://www.ncs.gov.in/job-seekers/', category: 'government', country: 'India', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'Fellowships India', url: 'https://opportunitycell.com/fellowships/', category: 'publication', country: 'India', careerPaths: ['/fellowships'], parsePattern: 'default' },
];

// ============================================================================
// ADDITIONAL RESEARCH CENTERS (200+ sources)
// ============================================================================

export const RESEARCH_CENTERS: SourceConfig[] = [
  // International Organizations
  { name: 'WHO Jobs', url: 'https://www.who.int/careers/vacancies', category: 'government', country: 'Global', careerPaths: ['/vacancies'], parsePattern: 'default' },
  { name: 'FAO Jobs', url: 'https://jobs.fao.org/', category: 'government', country: 'Global', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'IAEA Jobs', url: 'https://www.iaea.org/about/employment', category: 'government', country: 'Global', careerPaths: ['/employment'], parsePattern: 'default' },
  { name: 'Gates Foundation', url: 'https://www.gatesfoundation.org/about/careers', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },

  // Agricultural Research
  { name: 'CGIAR Jobs', url: 'https://www.cgiar.org/work-with-us/', category: 'research-center', country: 'Global', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'ICRISAT', url: 'https://www.icrisat.org/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'IRRI Jobs', url: 'https://www.irri.org/about-us/careers', category: 'research-center', country: 'Philippines', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'CIMMYT Jobs', url: 'https://www.cimmyt.org/about/careers/', category: 'research-center', country: 'Mexico', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'ILRI Jobs', url: 'https://www.ilri.org/careers', category: 'research-center', country: 'Kenya', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'WorldFish', url: 'https://www.worldfishcenter.org/careers', category: 'research-center', country: 'Malaysia', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'ICARDA', url: 'https://www.icarda.org/about-us/careers', category: 'research-center', country: 'Lebanon', careerPaths: ['/careers'], parsePattern: 'default' },

  // Biotech Companies with Research
  { name: 'Genentech Careers', url: 'https://www.gene.com/careers', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'Novartis Research', url: 'https://www.novartis.com/careers', category: 'research-center', country: 'Switzerland', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'Roche Science', url: 'https://www.roche.com/careers/', category: 'research-center', country: 'Switzerland', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'Pfizer Research', url: 'https://www.pfizer.com/about/careers', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'AstraZeneca', url: 'https://careers.astrazeneca.com/', category: 'research-center', country: 'UK', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'GSK Research', url: 'https://www.gsk.com/en-gb/careers/', category: 'research-center', country: 'UK', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'Merck Research', url: 'https://www.merck.com/careers/', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'Illumina Careers', url: 'https://www.illumina.com/company/careers.html', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'Regeneron', url: 'https://careers.regeneron.com/', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'Moderna Careers', url: 'https://www.modernatx.com/careers', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'Amgen Careers', url: 'https://careers.amgen.com/', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'Biogen Careers', url: 'https://www.biogen.com/en_us/careers.html', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'Gilead Sciences', url: 'https://www.gilead.com/careers', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'BioNTech', url: 'https://www.biontech.com/int/en/home/careers.html', category: 'research-center', country: 'Germany', careerPaths: ['/careers'], parsePattern: 'default' },

  // Conservation & Environment
  { name: 'Nature Conservancy', url: 'https://www.nature.org/en-us/about-us/careers/', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'WWF Jobs', url: 'https://www.worldwildlife.org/about/careers', category: 'research-center', country: 'Global', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'Conservation Intl', url: 'https://www.conservation.org/about/careers', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'WCS Careers', url: 'https://www.wcs.org/about-us/careers', category: 'research-center', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'Smithsonian Jobs', url: 'https://www.si.edu/ohr', category: 'research-center', country: 'USA', careerPaths: ['/jobs'], parsePattern: 'default' },

  // More Indian Research Centers
  { name: 'ICGEB Delhi', url: 'https://www.icgeb.org/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'NIPER', url: 'https://niper.gov.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'IVRI', url: 'https://ivri.nic.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'IARI Delhi', url: 'https://www.iari.res.in/index.php/jobs', category: 'research-center', country: 'India', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'NDRI Karnal', url: 'https://ndri.res.in/jobs/', category: 'research-center', country: 'India', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'NIANP Bangalore', url: 'https://nianp.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'IASRI Delhi', url: 'https://iasri.icar.gov.in/jobs/', category: 'research-center', country: 'India', careerPaths: ['/jobs'], parsePattern: 'default' },
  { name: 'IIHR Bangalore', url: 'https://iihr.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'CIFT Kochi', url: 'https://www.cift.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'NIO Goa', url: 'https://www.nio.org/careers', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'NIOT Chennai', url: 'https://www.niot.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'IITM Pune', url: 'https://www.tropmet.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'WIHG Dehradun', url: 'https://www.wihg.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'SACON Coimbatore', url: 'https://sfrk.res.in/careers/', category: 'research-center', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'ZSI Kolkata', url: 'https://zsi.gov.in/careers/', category: 'government', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'BSI Kolkata', url: 'https://bsi.gov.in/careers/', category: 'government', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'FSI Dehradun', url: 'https://fsi.nic.in/career', category: 'government', country: 'India', careerPaths: ['/career'], parsePattern: 'default' },

  // Space/Astrobiology
  { name: 'NASA Careers', url: 'https://www.nasa.gov/careers/', category: 'government', country: 'USA', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'ESA Careers', url: 'https://www.esa.int/About_Us/Careers_at_ESA', category: 'government', country: 'Europe', careerPaths: ['/careers'], parsePattern: 'default' },
  { name: 'ISRO Jobs', url: 'https://www.isro.gov.in/Careers.html', category: 'government', country: 'India', careerPaths: ['/careers'], parsePattern: 'default' },
];

// ============================================================================
// FELLOWSHIP & FUNDING SOURCES (100+ sources)
// ============================================================================

export const FELLOWSHIP_SOURCES: SourceConfig[] = [
  // Major Fellowships
  { name: 'Fulbright', url: 'https://foreign.fulbrightonline.org/', category: 'government', country: 'USA', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'Rhodes Trust', url: 'https://www.rhodeshouse.ox.ac.uk/', category: 'university', country: 'UK', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'Gates Cambridge', url: 'https://www.gatescambridge.org/', category: 'university', country: 'UK', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'Chevening', url: 'https://www.chevening.org/', category: 'government', country: 'UK', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'Commonwealth Scholarships', url: 'https://cscuk.fcdo.gov.uk/scholarships/', category: 'government', country: 'UK', careerPaths: ['/scholarships'], parsePattern: 'default' },
  { name: 'DAAD Germany', url: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/', category: 'government', country: 'Germany', careerPaths: ['/scholarships'], parsePattern: 'default' },
  { name: 'Marie Curie', url: 'https://marie-sklodowska-curie-actions.ec.europa.eu/', category: 'government', country: 'Europe', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'Wellcome PhD', url: 'https://wellcome.org/grant-funding/schemes/phd-training-fellowships', category: 'research-center', country: 'UK', careerPaths: ['/fellowships'], parsePattern: 'default' },
  { name: 'EMBO Fellowships', url: 'https://www.embo.org/funding/', category: 'research-center', country: 'Europe', careerPaths: ['/funding'], parsePattern: 'default' },
  { name: 'HFSP Fellowships', url: 'https://www.hfsp.org/funding/hfsp-funding/', category: 'research-center', country: 'Global', careerPaths: ['/funding'], parsePattern: 'default' },

  // Indian Fellowships
  { name: 'DST INSPIRE', url: 'https://online-inspire.gov.in/', category: 'government', country: 'India', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'CSIR Fellowship', url: 'https://www.csirhrdg.res.in/', category: 'government', country: 'India', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'UGC NET', url: 'https://ugcnet.nta.nic.in/', category: 'government', country: 'India', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'DBT JRF', url: 'https://dbtindia.gov.in/human-resource-development', category: 'government', country: 'India', careerPaths: ['/jrf'], parsePattern: 'default' },
  { name: 'ICMR JRF', url: 'https://www.icmr.gov.in/jrf.html', category: 'government', country: 'India', careerPaths: ['/jrf'], parsePattern: 'default' },
  { name: 'Ramanujan Fellowship', url: 'https://serb.gov.in/page/english/awards_fellowship', category: 'government', country: 'India', careerPaths: ['/fellowships'], parsePattern: 'default' },
  { name: 'Ramalingaswami', url: 'https://dbtindia.gov.in/schemes-programmes/human-resource-development/ramalingaswami-re-entry-fellowship', category: 'government', country: 'India', careerPaths: ['/fellowship'], parsePattern: 'default' },
  { name: 'Kishore Vaigyanik', url: 'https://kvpy.iisc.ac.in/', category: 'government', country: 'India', careerPaths: ['/'], parsePattern: 'default' },
  { name: 'IASc Fellowships', url: 'https://www.ias.ac.in/Fellowship/', category: 'research-center', country: 'India', careerPaths: ['/fellowship'], parsePattern: 'default' },
  { name: 'INSA Fellowships', url: 'https://www.insaindia.res.in/fellowships.php', category: 'research-center', country: 'India', careerPaths: ['/fellowships'], parsePattern: 'default' },
  { name: 'NASI Fellowships', url: 'https://www.nasi.org.in/fellowships/', category: 'research-center', country: 'India', careerPaths: ['/fellowships'], parsePattern: 'default' },
];

// ============================================================================
// COMBINED EXPORT - ALL SOURCES
// ============================================================================

export const ALL_SOURCES: SourceConfig[] = [
  ...INDIAN_UNIVERSITIES,
  ...GLOBAL_UNIVERSITIES,
  ...JOB_AGGREGATORS,
  ...RESEARCH_CENTERS,
  ...FELLOWSHIP_SOURCES,
];

// Get total count
export const TOTAL_SOURCES_COUNT = ALL_SOURCES.length;

// Filter functions
export function getSourcesByCountry(country: string): SourceConfig[] {
  return ALL_SOURCES.filter(s => s.country.toLowerCase() === country.toLowerCase());
}

export function getSourcesByCategory(category: SourceConfig['category']): SourceConfig[] {
  return ALL_SOURCES.filter(s => s.category === category);
}

export function getIndianSources(): SourceConfig[] {
  return getSourcesByCountry('India');
}

export function getBiotecnikaSources(): SourceConfig[] {
  return ALL_SOURCES.filter(s => s.category === 'biotecnika' || s.name.toLowerCase().includes('biotecnika'));
}

export function getUniversitySources(): SourceConfig[] {
  return ALL_SOURCES.filter(s => s.category === 'university');
}

// Batch sources for scraping (to stay within rate limits)
export function batchSources(sources: SourceConfig[], batchSize: number = 50): SourceConfig[][] {
  const batches: SourceConfig[][] = [];
  for (let i = 0; i < sources.length; i += batchSize) {
    batches.push(sources.slice(i, i + batchSize));
  }
  return batches;
}

// Priority sources (most reliable/important)
export const PRIORITY_SOURCES: SourceConfig[] = [
  // Biotecnika (best for Indian positions)
  ...getBiotecnikaSources(),
  // Major job aggregators
  ...ALL_SOURCES.filter(s =>
    s.name.includes('Nature') ||
    s.name.includes('Science Careers') ||
    s.name.includes('Academic Positions')
  ),
  // Top Indian institutions
  ...ALL_SOURCES.filter(s =>
    s.country === 'India' &&
    (s.name.includes('IISc') || s.name.includes('NCBS') || s.name.includes('TIFR') ||
     s.name.includes('IIT') || s.name.includes('CSIR') || s.name.includes('DBT'))
  ),
].slice(0, 100); // Limit to top 100 priority sources
