import "server-only";

export { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";
export {
  listAdminPrograms,
  listPublicPrograms,
  getProgramById,
  type CurriculumProgramDto,
  type CurriculumCourseDto,
} from "./_internal/services";
