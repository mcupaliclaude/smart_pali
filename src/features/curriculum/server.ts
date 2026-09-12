import "server-only";

export { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";
export {
  listAdminPrograms,
  listPublicPrograms,
  getProgramById,
  listAdminDepartmentsWithCounts,
  getDepartmentById,
  type CurriculumProgramDto,
  type CurriculumCourseDto,
  type DepartmentWithCountsDto,
  type DepartmentProgramSummaryDto,
} from "./_internal/services";
